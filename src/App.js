/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import './App.css';

const fileSizes = ['h-12', 'h-24', 'h-36'];
// const randomColorStyle = () => { backgroundColor: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})` };

const random = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));

export default function App() {

  const [data, setData] = useState({
    folders: [...Array(5)].map(() => {return {
      thread: new Worker(new URL('./folderWorker.js', import.meta.url)),
      uploadingFileIndex: null
    }}),
    clients: [...Array(random(1, 10))].map(() => {return {
        files: [...Array(random(1, 5))].map(() => {return {
            size: random(1, 3),
            uploadingFolderIndex: null
        }}).sort((a, b) => (a.size > b.size) ? 1 : (-1)).reverse()
    }})
  });

  

  useEffect(() => {

    upload();

    arbiter();

  }, []);

  useEffect(() => drawConnections());

  const getFolderObject = (folderIndex) => document.getElementById('folders-container')?.children[folderIndex]?.firstElementChild;
  const getFileObject = (fileIndex) => document.getElementById('clients-container')?.children[fileIndex[0]]?.firstElementChild?.children[fileIndex[1] + 1];

  function upload() {

    data.folders.forEach((folder, folderIndex) => folder.thread.onmessage = (e) => {

      const folderObject = getFolderObject(folderIndex);

      const upload = e.data;

      if (upload >= 100) {
 
          folderObject.innerHTML = folderIndex + 1;

          const dataCopy = data;
          const clientIndex = folder.uploadingFileIndex[0];
          const fileIndex = folder.uploadingFileIndex[1];

          dataCopy.clients[clientIndex].files.splice(fileIndex, 1);
          for (let j = fileIndex; j < dataCopy.clients[clientIndex].files.length; ++j) {
            if (dataCopy.clients[clientIndex].files[j].uploadingFolderIndex !== null) {
              dataCopy.folders[dataCopy.clients[clientIndex].files[j].uploadingFolderIndex].uploadingFileIndex[1] = j;
            }
          }

          if (dataCopy.clients[clientIndex].files.length <= 0) {
            dataCopy.clients.splice(clientIndex, 1);
            for (let i = clientIndex; i < dataCopy.clients.length; ++i) {
              for (let j = 0; j < dataCopy.clients[i].files.length; ++ j) {
                if (dataCopy.clients[i].files[j].uploadingFolderIndex !== null) {
                  dataCopy.folders[dataCopy.clients[i].files[j].uploadingFolderIndex].uploadingFileIndex[0] = i;
                }
              }
            }
          }

          dataCopy.folders[folderIndex].uploadingFileIndex = null;

          setData({...dataCopy});

      } else folderObject.innerHTML = `${upload}%`;

    });

  };

  function drawConnections() {

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const canvasContext = canvas.getContext('2d');
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.lineWidth = 5;

    data.folders.forEach((folder, folderIndex) => {
      if (folder.uploadingFileIndex === null) return;
      const folderRectangle = getFolderObject(folderIndex).getBoundingClientRect();
      const fileRectangle = getFileObject(folder.uploadingFileIndex).getBoundingClientRect();
      canvasContext.beginPath();
      canvasContext.moveTo(folderRectangle.left + folderRectangle.width / 2, folderRectangle.bottom - 2);
      canvasContext.lineTo(fileRectangle.left + fileRectangle.width / 2, fileRectangle.top + 2);
      canvasContext.stroke();
    });

  };

  function getFreeFolderIndex() {
    for (let i = 0; i < data.folders.length; ++i) {
        const folder = data.folders[i];
        if (folder.uploadingFileIndex === null) return i;
    }
    return null;
  };

  function getBestFileIndex() {
      for (let i = 0; i < data.clients.length; ++i) {
          const client = data.clients[i];
          for (let j = 0; j < client.files.length; ++j) {
              const file = client.files[j];
              if (file.uploadingFolderIndex === null) return [i, j];
          }
      }
      return null;
  };

  // let arbiterRunning = false;

  function arbiter() {

      // if (arbiterRunning) return;
      // console.log('run arbiter');
      // arbiterRunning = true;

      const folderIndex = getFreeFolderIndex();
      const fileIndex = getBestFileIndex();

      // console.log(folderIndex);
      // console.log(fileIndex);

      if (folderIndex == null || fileIndex == null) {
        setTimeout(arbiter, 2000);
        return;
      }

      const folder = data.folders[folderIndex];
      const file = data.clients[fileIndex[0]].files[fileIndex[1]];

      // console.log(folder);
      // console.log(file);

      // folder.thread.postMessage(JSON.parse(JSON.stringify({ data: data, folderIndex: folderIndex, fileIndex: fileIndex })));
      folder.thread.postMessage(null);

      const dataCopy = data;
      dataCopy.folders[folderIndex].uploadingFileIndex = fileIndex;
      dataCopy.clients[fileIndex[0]].files[fileIndex[1]].uploadingFolderIndex = folderIndex;
      setData({...dataCopy});

      // arbiterRunning = false;

      // arbiter();

      setTimeout(arbiter, 100);

  };

  function generateClient() {

    // const dataCopy = data;
    // dataCopy.clients.splice(dataCopy.clients.length - 1, 1);
    // setData({...dataCopy});

  };

  return (
    <>
      <canvas id="canvas" className="absolute" width="100%" height="100%"></canvas>
      <div className="grid grid-rows-3 bg-cyan-100">
        <div id="folders-container" className="row-span-1 grid grid-cols-5">
          {
            [...data.folders].map((value, index) => (
              <div className="flex justify-center items-center" key={index}>
                <div className="bg-yellow-400 w-32 h-32 border-4 text-2xl font-bold border-black rounded text-center align-middle leading-[8rem]">{index + 1}</div>
              </div>
            ))
          }
        </div>
        <div className="row-span-2 grid grid-cols-11">
          <div id="clients-container" className="grid grid-cols-10 col-span-10">
            {
              [...data.clients].map((value, index) => (
                <div className="flex justify-center mb-2" key={index}>
                  <div className="flex flex-col-reverse w-1/2 gap-2">
                    <div className="h-12 text-2xl font-bold text-center leading-[3rem]">{index + 1}</div>
                    {
                      [...value.files].map((value, index) => (
                        <div className={`${fileSizes[value.size - 1]} bg-blue-300 border-4 rounded border-black`} key={index}></div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
          </div>
          <div className="w-16 my-4 mx-auto flex flex-col gap-4">
            <button className="flex-auto bg-black hover:bg-blue-700 py-2 px-4 rounded z-10" onClick={generateClient}>
              <p className="text-2xl text-white font-bold whitespace-nowrap centered-vertical-rl">Generate Client</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );

}
