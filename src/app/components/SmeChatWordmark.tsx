import { cn } from "./ui/utils";

const LOGO_SRC = "/smechat-logo.png";

type SmeChatWordmarkProps = {
  /** Koristi kao naslov (h1) ili običan div */
  as?: "h1" | "h2" | "div" | "span";
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
  /** inline = maskota lijevo od teksta; stacked = slika iznad natpisa */
  layout?: "inline" | "stacked";
  className?: string;
  logoClassName?: string;
};

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

const logoHeightsStacked = {
  sm: "h-16 max-h-16 w-auto",
  md: "h-24 max-h-24 w-auto",
  lg: "h-32 max-h-32 w-auto sm:h-36 sm:max-h-36",
} as const;

const logoHeightsInline = {
  sm: "h-9 max-h-9 w-auto",
  md: "h-11 max-h-11 w-auto",
  lg: "h-12 max-h-12 w-auto",
} as const;

export function SmeChatWordmark({
  as: Tag = "div",
  size = "md",
  showLogo = false,
  layout = "inline",
  className,
  logoClassName,
}: SmeChatWordmarkProps) {
  const stacked = Boolean(showLogo && layout === "stacked");

  return (
    <Tag
      className={cn(
        stacked ? "flex flex-col items-center gap-2.5 sm:gap-3" : "flex items-center gap-2.5",
        className,
      )}
    >
      {showLogo ? (
        <img
          src={LOGO_SRC}
          alt=""
          decoding="async"
          className={cn(
            stacked ? logoHeightsStacked[size] : logoHeightsInline[size],
            "shrink-0 object-contain object-center",
            logoClassName,
          )}
        />
      ) : null}
      <span className={cn("inline-flex items-baseline font-bold tracking-tight", textSizes[size])}>
        <span className="smechat-text-sme">Sme</span>
        <span className="smechat-text-chat">Chat</span>
      </span>
    </Tag>
  );
}

export { LOGO_SRC };
