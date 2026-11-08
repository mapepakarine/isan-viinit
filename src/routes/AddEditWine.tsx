import { useParams } from 'react-router-dom';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { fi } from '../i18n/fi';

export default function AddEditWine() {
  const { id } = useParams();
  return <ScreenPlaceholder title={id ? fi.titles.editWine : fi.titles.addWine} />;
}
