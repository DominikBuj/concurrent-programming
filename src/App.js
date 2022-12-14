import './App.css';

const fileFoldersCount = 5;
const fileFolders = () => [...Array(fileFoldersCount)].map((value, index) => <div>{index}</div>);

export default function App() {
  return (
    <div className='grid grid-rows-3'>
      <div className='row-span-1 grid grid-cols-5 bg-teal-200 FileFoldersContainer'>{fileFolders()}</div>
      <div className='row-span-2 bg-teal-800 ClientsContainer'></div>
    </div>
  );
}
