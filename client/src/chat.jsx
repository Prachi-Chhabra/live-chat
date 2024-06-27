import { useEffect, useState } from "react";

export default function Chat() {
    const [ws, setWs] = useState(null);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);
    function handleMessage(e) {
        console.log('new message', e);
    }
    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3">
                Contacts
            </div>
            <div className="flex flex-col bg-blue-100 w-2/3">
                <div className="flex-grow">messages with selected person</div>
                <div className="flex gap-2 p-2">
                    <input type="text"
                        placeholder="tupe your message here"
                        className="bg-white border flex-grow p-2" />
                    <button className="bg-blue-500 p-2 text-white">Send</button>
                </div>
            </div>
        </div>
    )
}