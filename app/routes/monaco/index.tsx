import Editor from "@monaco-editor/react";

export default function Monaco() {
  return (
   <Editor
     height="90vh"
     defaultLanguage="javascript"
     defaultValue="// some comment"
   />
  );
}
