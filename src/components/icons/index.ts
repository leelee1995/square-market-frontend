import { BR, US } from "./flags";

export const FLAG_ICONS: Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
    us: US,
    br: BR,
};
