import { DeviceFrame } from "./preview/DeviceFrame";
import { HomeScreen } from "./screens/HomeScreen";

export default function App() {
    return (
        <DeviceFrame>
            <HomeScreen />
        </DeviceFrame>
    );
}
