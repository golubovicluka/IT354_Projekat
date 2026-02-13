import { Excalidraw } from '@excalidraw/excalidraw'
import "@excalidraw/excalidraw/index.css";

const ExcalidrawView = () => {
    return (
        <div className="relative min-h-[400px] flex-1">
            <Excalidraw />
        </div>
    )
}

export default ExcalidrawView
