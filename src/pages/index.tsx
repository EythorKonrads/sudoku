import type { NextPage } from 'next';
import SudokuBoard from '../components/SudokuBoard';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SudokuBoard />
    </div>
  );
};

export default Home;
