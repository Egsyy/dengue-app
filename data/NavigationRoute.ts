import { ReactNode } from "react";



export const LandingRoutes: NavigationRoutes[] = [
    {
        label: "Home",
        href: "/#",

    },
    {
        label: "About Us",
        href: "/#",
    }
]

export interface NavigationRoutes {
    label: string,
    icon?: ReactNode,
    href?: string,
}