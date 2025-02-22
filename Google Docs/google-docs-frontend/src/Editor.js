import React, { useCallback, useEffect, useState } from "react";
import Quill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const Editor = () => {
  const { id: docId } = useParams();
  const [socket, setSocket] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log("Connecting to socket...");
    const s = io("http://localhost:5000");

    s.on("connect", () => {
      console.log("Connected to backend socket.io ✅");
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !docId) return;
    
    console.log("Fetching document:", docId);
    socket.emit("get-document", docId);

    socket.on("load-document", (data) => {
      console.log("Document loaded:", data);
      setContent(data);
    });

    socket.on("receive-changes", (delta) => {
      console.log("Received changes:", delta);
      setContent((prev) => prev + delta);
    });

  }, [socket, docId]);

  const handleChange = useCallback(
    (delta, oldContent, source) => {
      if (source !== "user" || !socket) return;
      console.log("User made changes:", delta);
      socket.emit("send-changes", delta);
      socket.emit("save-document", content);
    },
    [socket, content]
  );

  return (
    <div>
      <h2>Google Docs Clone</h2>
      <Quill value={content} onChange={handleChange} theme="snow" />
    </div>
  );
};

export default Editor;
