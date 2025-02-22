import React, { useEffect, useState } from "react";
 import Quill from "react-quill"; 
 import "react-quill/dist/quill.snow.css";
  import { io } from "socket.io-client"; 
  import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

const TextEditor = () => { const { docId } = useParams();
 const [content, setContent] = useState("");

useEffect(() => { socket.emit("join-document", docId); 
    socket.on("load-document", (document) => setContent(document)); 
    socket.on("receive-changes", (delta) => { setContent((prev) => prev + delta); }); }, [docId]);

const handleChange = (value) => { setContent(value);
     socket.emit("send-changes", value); };

return <Quill value={content} onChange={handleChange} />; };

export default TextEditor;