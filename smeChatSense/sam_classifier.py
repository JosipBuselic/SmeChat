import os
import torch
import numpy as np
from PIL import Image

try:
    from sam3.model_builder import build_sam3_image_model
except ImportError:
    try:
        from sam3 import build_sam3_image_model
    except ImportError:
        build_sam3_image_model = None

try:
    from sam3.model.sam3_image_processor import Sam3Processor
except ImportError:
    Sam3Processor = None

_SAM3_AVAILABLE = build_sam3_image_model is not None and Sam3Processor is not None

# Applied once when using SAM3 on CPU (Windows / no GPU): upstream assumes CUDA-style paths.
_sam3_cpu_compat_done = False


def _ensure_sam3_cpu_compat():
    """Fix SAM3 CPU crashes: bf16 fused MLP vs fp32 fc2, and pin_memory without a GPU."""
    global _sam3_cpu_compat_done
    if _sam3_cpu_compat_done:
        return
    if torch.cuda.is_available():
        _sam3_cpu_compat_done = True
        return

    import torch.nn.functional as Fn
    from sam3.model import vitdet as vitdet_mod

    def addmm_act_fp32(activation, linear, mat1):
        if torch.is_grad_enabled():
            raise ValueError("Expected grad to be disabled.")
        x = Fn.linear(mat1, linear.weight, linear.bias)
        if activation in (Fn.gelu, torch.nn.GELU):
            x = Fn.gelu(x)
        elif activation in (Fn.relu, torch.nn.ReLU):
            x = Fn.relu(x)
        else:
            raise ValueError(f"Unexpected activation {activation}")
        return x

    vitdet_mod.addmm_act = addmm_act_fp32

    _orig_pin_memory = torch.Tensor.pin_memory

    def _pin_memory_if_cuda(self):
        if not torch.cuda.is_available():
            return self
        return _orig_pin_memory(self)

    torch.Tensor.pin_memory = _pin_memory_if_cuda
    _sam3_cpu_compat_done = True


if not _SAM3_AVAILABLE:
    print(
        "Warning: SAM 3 is not installed or not in PYTHONPATH. "
        "Install from https://github.com/facebookresearch/sam3; SAM3ImageClassifier will raise on construction."
    )

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None

COMPONENT_PROMPTS = {
    "paper": [
        "paper",
        "sheet of paper",
        "newspaper",
        "magazine",
        "cardboard",
        "cardboard box",
        "paper packaging",
        "office paper",
        "printed paper",
        "paper stack",
        "paper bag",
        "recycled paper",
        "kraft paper",
        "carton",
    ],
    "plastic": [
        "plastic",
        "plastic bottle",
        "plastic container",
        "plastic packaging",
        "plastic wrapper",
        "plastic bag",
        "transparent plastic",
        "plastic cup",
        "plastic lid",
        "pet bottle",
        "squeezable bottle",
        "plastic tray",
        "milk carton",
        "juice box",
        "tetra pak",
        "drink carton",
        "liquid packaging",
        "beverage carton",
        "metal",
        "metal can",
        "aluminum can",
        "steel can",
        "tin can",
        "metal container",
        "food can",
        "beverage can",
        "crushed can",
        "scrap metal",
    ],
    "glass": [
        "glass",
        "glass bottle",
        "glass jar",
        "transparent glass",
        "green glass bottle",
        "brown glass bottle",
        "glass container",
        "broken glass",
        "glass shard",
        "clear glass",
        "glass cup",
    ],
    "organic": [
        "organic waste",
        "food waste",
        "fruit peel",
        "vegetable scraps",
        "leftover food",
        "banana peel",
        "apple core",
        "compost",
        "kitchen waste",
    ],
    "battery": [
        "battery",
        "aa battery",
        "aaa battery",
        "lithium battery",
        "rechargeable battery",
        "button cell",
        "used battery",
    ],
    "hazardous": [
        "hazardous waste",
        "paint can",
        "chemical container",
        "cleaning chemicals",
        "toxic material",
        "oil container",
        "solvent",
        "pesticide",
        "clothes",
        "old clothes",
        "fabric",
        "textile",
        "shirt",
        "pants",
        "cloth material",
        "garment",
        "worn clothing",
        "construction waste",
        "brick",
        "concrete",
        "cement debris",
        "tiles",
        "ceramic tile",
        "rubble",
        "plaster",
        "rubber",
        "rubber tire",
        "tire",
        "rubber material",
        "black rubber",
        "rubber strip",
        "elastic material",
    ],
}


def _max_score_from_detections(scores):
    """Best confidence from SAM3 `scores` (tensor, ndarray, or sequence)."""
    if scores is None:
        return None
    if isinstance(scores, torch.Tensor):
        if scores.numel() == 0:
            return None
        return float(scores.max().detach().cpu().item())
    if isinstance(scores, np.ndarray):
        if scores.size == 0:
            return None
        return float(np.max(scores))
    try:
        if len(scores) == 0:
            return None
        return float(max(scores))
    except (TypeError, ValueError):
        return None


class SAM3ImageClassifier:
    def __init__(
        self,
        bpe_path=None,
        confidence_threshold=0.15,
        verbose=False,
        max_prompts_per_category=1,
    ):
        """
        Initializes the SAM 3 Image Classifier.

        Args:
            bpe_path (str, optional): Path to the BPE vocabulary file required by SAM 3.
                                      If None, attempts to find it in the installed sam3 package.
            confidence_threshold (float): Confidence threshold for SAM 3 processor and final label.
            verbose (bool): If True, print per-category scores during classification.
            max_prompts_per_category (int, optional): Use at most this many prompts per category.
                Default 1 keeps inference fast. Use None to try every prompt in COMPONENT_PROMPTS.
        """
        if not _SAM3_AVAILABLE:
            raise ImportError(
                "sam3 is not installed. Clone/install SAM 3 from "
                "https://github.com/facebookresearch/sam3 and ensure it is on PYTHONPATH."
            )

        if bpe_path is None:
            try:
                import sam3

                bpe_path = os.path.join(
                    os.path.dirname(sam3.__file__),
                    "assets",
                    "bpe_simple_vocab_16e6.txt.gz",
                )
            except ImportError:
                bpe_path = "sam3/assets/bpe_simple_vocab_16e6.txt.gz"

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        if self.device == "cuda":
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True

        self.confidence_threshold = confidence_threshold
        self.verbose = verbose

        self.model = build_sam3_image_model(bpe_path=bpe_path, device=self.device)
        self.processor = Sam3Processor(
            self.model,
            device=self.device,
            confidence_threshold=self.confidence_threshold,
        )

    def _segment_with_text_prompt(self, pil_image, text_prompt):
        try:
            state = self.processor.set_image(pil_image)
            # API: set_text_prompt(prompt, state) — returns updated state with masks/boxes/scores
            state = self.processor.set_text_prompt(text_prompt, state)

            masks = state.get("masks", None)
            boxes = state.get("boxes", None)
            scores = state.get("scores", None)

            if masks is None:
                return None, None, None
            if isinstance(masks, torch.Tensor) and masks.numel() == 0:
                return None, None, None
            if isinstance(masks, (list, tuple)) and len(masks) == 0:
                return None, None, None

            return masks, boxes, scores
        except Exception as e:
            if self.verbose:
                print(
                    f"Error in _segment_with_text_prompt for prompt {text_prompt!r}: {e}"
                )
            return None, None, None

    def classify_image(self, image):
        """
        Classifies an image using SAM 3 by checking which category's text prompt
        yields the highest confidence score.

        Args:
            image (str or PIL.Image.Image): A PIL Image object or a file path to the image.

        Returns:
            str: The detected class string (e.g., 'plastic', 'paper') or 'Unknown' if nothing
                 meets the confidence threshold.
        """
        if isinstance(image, str):
            try:
                pil_img = Image.open(image)
                if pil_img.mode != "RGB":
                    pil_img = pil_img.convert("RGB")
            except Exception as e:
                print(f"Error loading image from {image}: {e}")
                return "Unknown"
        else:
            pil_img = image
            if pil_img.mode != "RGB":
                pil_img = pil_img.convert("RGB")

        if self.device == "cuda":
            with torch.autocast("cuda", dtype=torch.bfloat16):
                return self._run_classification(pil_img)
        return self._run_classification(pil_img)

    def _run_classification(self, pil_img):
        best_class = "Unknown"
        max_score = 0.0

        for category, prompts in COMPONENT_PROMPTS.items():
            if self.max_prompts_per_category is None:
                to_try = prompts
            else:
                to_try = prompts[: self.max_prompts_per_category]
            category_best = 0.0
            for text_prompt in to_try:
                _masks, _boxes, scores = self._segment_with_text_prompt(
                    pil_img, text_prompt
                )
                s = _max_score_from_detections(scores)
                if s is not None:
                    category_best = max(category_best, s)

            if self.verbose:
                if category_best > 0:
                    print(f"  [{category}] best score: {category_best:.4f}")
                else:
                    print(f"  [{category}] no detections.")

            if category_best > max_score:
                max_score = category_best
                best_class = category

        if max_score < self.confidence_threshold:
            if self.verbose:
                print(
                    f"No class above threshold {self.confidence_threshold:.3f} "
                    f"(best raw {max_score:.4f})."
                )
            return "Unknown"

        if self.verbose:
            print(f"Final max confidence score: {max_score:.3f} → {best_class}")
        return best_class


if __name__ == "__main__":
    import time

    print("Loading SAM 3 Image Classifier...")
    try:
        start_time = time.time()
        classifier = SAM3ImageClassifier(confidence_threshold=0.03, verbose=True)
        print(f"Classifier loaded in {time.time() - start_time:.2f} seconds.")

        print("Classifying test.jpg...")
        result = classifier.classify_image("test.jpg")
        print(f"Detected class: {result}")
    except ImportError as err:
        print(err)
