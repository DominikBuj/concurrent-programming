/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

let clientCounter = 20;

const random = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));

const getFilePixelSize = (fileSize) => (fileSize * 120) + 24;

const getFolderObject = (folderIndex) => document.getElementById('folders-container').children[folderIndex].firstElementChild;
const getFileObject = (clientIndex, fileIndex) => document.getElementById('clients-container').children[clientIndex]?.firstElementChild.children[fileIndex + 1];


export default function App() {

  const [, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [data, setData] = useState({
    folders: [...Array(5)].map(() => {return {
      thread: new Worker(new URL('./folderWorker.js', import.meta.url)),
      clientIndex: null,
      fileIndex: null
    }}),
    clients: [...Array(clientCounter)].map((value, index) => {return {
        counter: index + 1,
        creationTime: Date.now(),
        files: [...Array(random(1, 5))].map(() => {return {
            size: random(1, 100) * 0.01,
            folderIndex: null
        }}).sort((a, b) => (a.size > b.size) ? 1 : (-1)).reverse()
    }})
  });

  useEffect(() => { handleResize(); handleUploads(); clientCounter = data.clients.length; }, []);

  useEffect(() => drawUploads());

  let started = false;

  const handleResize = () => window.addEventListener('resize', () => setWindowSize({ width: window.innerWidth, height: window.innerHeight }));

  function handleUploads() {

    data.folders.forEach((folder, folderIndex) => folder.thread.onmessage = (e) => {

      const folderObject = getFolderObject(folderIndex);

      const upload = e.data;

      if (upload >= 100) {
 
          folderObject.innerHTML = null;

          const dataCopy = data;
          const clientIndex = folder.clientIndex;
          const fileIndex = folder.fileIndex;

          dataCopy.clients[clientIndex].files.splice(fileIndex, 1);
          for (let j = fileIndex; j < dataCopy.clients[clientIndex].files.length; ++j) {
            if (dataCopy.clients[clientIndex].files[j].folderIndex !== null) {
              dataCopy.folders[dataCopy.clients[clientIndex].files[j].folderIndex].fileIndex = j;
            }
          }

          if (dataCopy.clients[clientIndex].files.length <= 0) {
            dataCopy.clients.splice(clientIndex, 1);
            for (let i = clientIndex; i < dataCopy.clients.length; ++i) {
              for (let j = 0; j < dataCopy.clients[i].files.length; ++j) {
                if (dataCopy.clients[i].files[j].folderIndex !== null) {
                  dataCopy.folders[dataCopy.clients[i].files[j].folderIndex].clientIndex = i;
                }
              }
            }
          }

          dataCopy.folders[folderIndex].clientIndex = null;
          dataCopy.folders[folderIndex].fileIndex = null;

          setData({...dataCopy});

      } else folderObject.innerHTML = `${upload}%`;

    });

  }

  function drawUploads() {

    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const canvasContext = canvas.getContext('2d');
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.lineWidth = 3;

    data.folders.forEach((folder, folderIndex) => {
      if (folder.clientIndex === null || folder.fileIndex === null) return;
      const folderRectangle = getFolderObject(folderIndex).getBoundingClientRect();
      const fileRectangle = getFileObject(folder.clientIndex, folder.fileIndex).getBoundingClientRect();
      canvasContext.beginPath();
      canvasContext.moveTo(folderRectangle.left + folderRectangle.width / 2, folderRectangle.bottom - 2);
      canvasContext.lineTo(fileRectangle.left + fileRectangle.width / 2, fileRectangle.top + 1);
      canvasContext.stroke();
    });

  }

  function getFreeFolderIndex() {
    for (let i = 0; i < data.folders.length; ++i) {
        const folder = data.folders[i];
        if (folder.clientIndex === null || folder.fileIndex === null) return i;
    }
    return null;
  }

  function existsFreeFile() {
    for (let i = 0; i < data.clients.length; ++i) {
      const client = data.clients[i];
      for (let j = 0; j < client.files.length; ++j) {
          const file = client.files[j];
          if (file.folderIndex === null) return true;
      }
    }
    return false;
  }

  function getFilePriority(clientIndex, fileIndex) {
    
    const client = data.clients[clientIndex];
    const file = client.files[fileIndex];
    
    const q = data.clients.length;
    const t = (Date.now() - client.creationTime) / 10000.0;
    const s = file.size;
    
    return ((t ** Math.E) / q) + ((1 / s) * q);
  
  }

  function getBestFileCombinedIndex() {

      let possibleFiles = [];

      for (let i = 0; i < data.clients.length; ++i) {
          const client = data.clients[i];
          for (let j = client.files.length - 1; j >= 0; --j) {
              const file = client.files[j];
              if (file.folderIndex === null) {
                const combinedIndex = [i, j];
                possibleFiles.push({
                  combinedIndex: combinedIndex,
                  priority: getFilePriority(i, j)
                });
                break;
              }
          }
      }

      return possibleFiles.sort((a, b) => (a.priority > b.priority) ? 1 : (-1)).pop().combinedIndex;

  }

  function runArbiter() {

      if (!started) {
        started = true;
        const dataCopy = data;
        dataCopy.clients.forEach(client => client.creationTime = Date.now());
        setData({...dataCopy});
      }

      const folderIndex = getFreeFolderIndex();
      if (folderIndex === null || !existsFreeFile()) {
        setTimeout(runArbiter, 100);
        return;
      }

      const [clientIndex, fileIndex] = getBestFileCombinedIndex();

      data.folders[folderIndex].thread.postMessage(data.clients[clientIndex].files[fileIndex].size);

      const dataCopy = data;
      dataCopy.folders[folderIndex].clientIndex = clientIndex;
      dataCopy.folders[folderIndex].fileIndex = fileIndex;
      dataCopy.clients[clientIndex].files[fileIndex].folderIndex = folderIndex;
      setData({...dataCopy});

      setTimeout(runArbiter, 100);

  }

  function generateClient() {

    if (data.clients.length >= 20) return;

    ++clientCounter;

    const dataCopy = data;
    dataCopy.clients.push({
      counter: clientCounter,
      creationTime: Date.now(),
      files: [...Array(random(1, 5))].map(() => {return {
          size: random(1, 100) * 0.01,
          folderIndex: null
      }}).sort((a, b) => (a.size > b.size) ? 1 : (-1)).reverse()
    });
    setData({...dataCopy});

  }

  return (
    <>

      <canvas id="canvas" className="fixed"></canvas>

      <div className="grid grid-cols-5 bg-slate-200">

        <div className="col-span-4 grid grid-rows-3">

          <div id="folders-container" className="grid grid-cols-5">
            {
              [...data.folders].map((value, index) => (
                <div className="flex justify-center items-center" key={index}>
                  <div className="bg-yellow-400 w-32 h-32 border-4 text-2xl font-bold border-black
                  rounded text-center align-middle leading-[8rem]"></div>
                </div>
              ))
            }
          </div>

          <div id="clients-container" className="row-span-2 grid grid-cols-[repeat(20,_1fr)]">
            {
              [...data.clients].map((value, index) => (
                <div className="flex justify-center mb-2" key={index}>
                  <div className="flex flex-col-reverse w-1/2 gap-2">
                    <div className="h-12 text-2xl font-bold text-center leading-[3rem]">{value.counter}</div>
                    {
                      [...value.files].map((value, index) => (
                        <div className="bg-blue-400 border-2 rounded border-black"
                          style={{height: `${getFilePixelSize(value.size)}px`}} key={index}></div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
          </div>

        </div>

        <div className="bg-slate-300 border-l-2 border-black flex flex-col p-2 gap-2">

          <button className="text-white focus:ring-4 rounded-lg px-5 py-2.5 bg-green-700 hover:bg-green-800
          focus:outline-none focus:ring-green-800 z-10 text-2xl font-bold" onClick={!started ? runArbiter : null}>
            Start
          </button>

          <button className="text-white focus:ring-4 rounded-lg px-5 py-2.5 bg-green-700 hover:bg-green-800
          focus:outline-none focus:ring-green-800 z-10 text-2xl font-bold" onClick={generateClient}>
            Generuj Klienta
          </button>

        </div>

      </div>

    </>
  );

}
