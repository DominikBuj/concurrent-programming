import Two from 'two.js';
import './App.css';
import FileFolder from './FileFolder';

const random = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));
const fileSizes = ['h-12', 'h-24', 'h-36'];
// const randomColorStyle = () => { backgroundColor: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})` };

// let two = new Two({ fullscreen: true }).appendTo(document.body);
// two.makeRectangle(70, 0, 100, 100);
// two.update();

const fileFoldersCount = 5;
const clientsData = [...Array(random(1, 10))].map(() => [...Array(random(1, 5))].map(() => random(0, 2)).sort().reverse());
// console.log(clientsData);

function FileFolders() {
  return (
    <div className="row-span-1 grid grid-cols-5">
      {
        [...Array(fileFoldersCount)].map((value, index) => (
          <div className="flex justify-center items-center" key={index}>
            <div className="bg-yellow-400 w-32 h-32 border-4 text-2xl font-bold border-black rounded text-center align-middle leading-[8rem]">{index + 1}</div>
          </div>
        ))
      }
    </div>
  )
}

function Clients() {
  return (
    <div className="row-span-2 grid grid-cols-11">
      <div className="grid grid-cols-10 col-span-10">
        {
          clientsData.map((value, index) => (
            <div className="flex justify-center mb-2" key={index}>
              <div className="flex flex-col-reverse w-1/2 gap-2">
                <div className="h-12 text-2xl font-bold text-center leading-[3rem]">{index + 1}</div>
                {
                  value.map((value, index) => (
                    <div className={`${fileSizes[value]} bg-blue-300 border-4 rounded border-black`} key={index}></div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
      <div className="w-16 my-4 mx-auto flex flex-col gap-4">
        <button className="flex-auto bg-black hover:bg-blue-700 py-2 px-4 rounded">
          <p className="text-2xl text-white font-bold whitespace-nowrap centered-vertical-rl">Generate Client</p>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="grid grid-rows-3 bg-cyan-100">
      {FileFolders()}
      {Clients()}
    </div>
  );
}
