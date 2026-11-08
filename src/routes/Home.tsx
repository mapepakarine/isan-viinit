import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import WineListItem from '../components/WineListItem';
import { db } from '../db/db';
import { fi } from '../i18n/fi';

export default function Home() {
  const wines = useLiveQuery(() => db.wines.orderBy('tastedAt').reverse().toArray());

  return (
    <>
      <h1 className="text-3xl font-bold text-wine">{fi.titles.home}</h1>
      {wines === undefined ? (
        <p className="mt-3 text-muted">{fi.loading}</p>
      ) : wines.length === 0 ? (
        <>
          <p className="mt-3 text-muted">{fi.home.empty}</p>
          <Link
            to="/wines/new"
            className="mt-4 flex min-h-14 items-center justify-center rounded-lg bg-wine px-4 font-bold text-white"
          >
            {fi.home.addFirst}
          </Link>
        </>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {wines.map((wine) => (
            <WineListItem key={wine.id} wine={wine} />
          ))}
        </ul>
      )}
    </>
  );
}
