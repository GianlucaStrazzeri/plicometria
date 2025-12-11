import PatientView from '@/components/exercise/PatientView';

export default function Page({ params }:{ params: { id: string } }) {
  return <PatientView initialClientId={params.id} />;
}
