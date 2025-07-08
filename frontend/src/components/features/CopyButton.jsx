import React , {useState} from "react";
import { useParams } from "react-router-dom";
import { FaRegClipboard } from "react-icons/fa";
import { Copy } from "lucide-react";
export default function CopyButton() {
  const { roomId } = useParams();
const [copyMessage, setCopyMessage] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
       setCopyMessage(true);
        setTimeout(() => {
          setCopyMessage(false);
        }, 10000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      })
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", left:"150px", marginBottom: "2px",marginLeft: "20px" }}>
      <strong>    Room Code:</strong>
      <span style={{ fontFamily: "monospace", background: "#eee", padding: "4px 8px", borderRadius: "4px" , color:"black"}}>
        {roomId}
      </span>
      <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer",color:"white"}} title="Copy">
        <Copy size={18} />
      </button>
      {copyMessage && <h6 style={{ color: "green" }}>Room code copied!</h6>}
    </div>
  );
}
