import { Excalidraw } from '@excalidraw/excalidraw'
import { useState } from 'react'
import "@excalidraw/excalidraw/index.css";

const ExcalidrawView = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    return (
        <div style={{ flexGrow: 1, minHeight: "400px", position: "relative" }}>
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
            />
        </div>
    )
}

export default ExcalidrawView