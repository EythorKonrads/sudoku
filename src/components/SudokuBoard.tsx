import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'
import { User } from '@supabase/supabase-js'

const SudokuBoard: React.FC = () => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [puzzle, setPuzzle] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    fetch('/api/puzzle')
      .then(res => res.json())
      .then(data => {
        setPuzzle(data)
      })
  }, [supabase])

  return (
    <div>
      <p>helloo</p>
      <pre>{JSON.stringify(puzzle, null, 2)}</pre>
    </div>
  );
};

export default SudokuBoard;
