import { Excalidraw } from '@excalidraw/excalidraw'
import "@excalidraw/excalidraw/index.css";

const ExcalidrawView = () => {
    return (
        <div style={{ flexGrow: 1, minHeight: "400px", position: "relative" }}>
            <Excalidraw />
        </div>
    )
}

export default ExcalidrawView
