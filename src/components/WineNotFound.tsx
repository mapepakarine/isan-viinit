import { Link } from 'react-router-dom';
import { fi } from '../i18n/fi';

export default function WineNotFound() {
  return (
    <>
      <p>{fi.form.notFound}</p>
      <Link to="/" className="mt-2 flex min-h-11 items-center font-semibold text-wine underline">
        {fi.form.backHome}
      </Link>
    </>
  );
}
