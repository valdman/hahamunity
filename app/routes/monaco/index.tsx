import { ActionFunction, json } from "@remix-run/node";
import Editor from "@monaco-editor/react";

import { getGitFile, saveGitFile } from '~/git/index.server';
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

const FILE_NAME = '.gitignore';

export async function loader() {
  const file = await getGitFile('boris', FILE_NAME);
  return json({file, fileName: FILE_NAME});
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log({formData});

  const action = formData.get("_action");
  if(action === 'commit') {
    const file = decodeURI(formData.get('file')?.toString() || '');
    const fileName = formData.get('fileName')?.toString() || '';
    if(!fileName || !file) {
      return;
    }
    const isSaved = await saveGitFile('boris', fileName, file)
    return {isSaved};
  }
};

export default function Monaco() {
  const {file: initFile, fileName} = useLoaderData();
  const [file, setFile] = useState<string | undefined>(initFile);
  
  return (
    <>
    <Form method="post">
      <button name="_action" value='commit'>
        Commit code
      </button>
      <input hidden readOnly name="file" value={encodeURI(file || '')} />
      <input hidden readOnly name="fileName" value={fileName} />
    </Form>
   <Editor
     height="90vh"
     defaultLanguage="python"
     value={file || ''}
     onChange={setFile}
   />
    </>
  );
}
