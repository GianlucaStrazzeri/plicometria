import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import DocViewer from "@/components/docs/DocViewer";

export const metadata: Metadata = {
  title: "Documentación del proyecto",
  description: "Documentación técnica y operativa del proyecto plicometria",
};

function readDoc(relativePath: string) {
  try {
    const p = path.join(process.cwd(), relativePath);
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    return `No se pudo leer ${relativePath}: ${String(e)}`;
  }
}

export default function DocsPage() {
  const readme = readDoc("docs/README.md");
  const deployment = readDoc("docs/deployment/supabase-production.md");
  const sqlReadme = readDoc("docs/sql/README.md");
  const sqlSchema = readDoc("docs/sql/db-schema.sql");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Documentación del proyecto</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Índice</h2>
        <ul className="list-disc pl-6">
          <li>
            <a href="#overview" className="text-blue-600">
              Resumen (docs/README.md)
            </a>
          </li>
          <li>
            <a href="#deployment" className="text-blue-600">
              Despliegue / Supabase
            </a>
          </li>
          <li>
            <a href="#sql-readme" className="text-blue-600">
              SQL README
            </a>
          </li>
          <li>
            <a href="#sql-schema" className="text-blue-600">
              Esquema SQL (db-schema.sql)
            </a>
          </li>
        </ul>
      </section>

      <section id="overview" className="mb-8">
        <h3 className="text-lg font-medium mb-2">Resumen (docs/README.md)</h3>
        <DocViewer content={readme} />
      </section>

      <section id="deployment" className="mb-8">
        <h3 className="text-lg font-medium mb-2">Despliegue / Supabase</h3>
        <DocViewer content={deployment} />
      </section>

      <section id="sql-readme" className="mb-8">
        <h3 className="text-lg font-medium mb-2">SQL README</h3>
        <DocViewer content={sqlReadme} />
      </section>

      <section id="sql-schema" className="mb-8">
        <h3 className="text-lg font-medium mb-2">Esquema SQL</h3>
        <pre className="whitespace-pre-wrap bg-gray-900 text-white p-4 rounded overflow-auto" style={{ maxHeight: "50vh" }}>
          {sqlSchema}
        </pre>
      </section>
    </div>
  );
}
