import { Text } from "@seed-design/react";
import type { ReactNode } from "react";
import "./AppScreen.css";

interface AppScreenProps {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}

/** Every screen in the app: safe-area aware app bar + scrollable body. */
export function AppScreen({ title, actions, children }: AppScreenProps) {
    return (
        <div className="app-screen">
            <header className="app-screen-bar">
                <Text as="h1" textStyle="t7Bold" color="fg.neutral" className="app-screen-bar-title">
                    {title}
                </Text>
                {actions}
            </header>
            <main className="app-screen-body">{children}</main>
        </div>
    );
}
