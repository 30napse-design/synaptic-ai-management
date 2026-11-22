import { readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { isIP } from "node:net";
import tls from "node:tls";
import { supabaseRootCA } from "./certificates/supabase-root-2021.mjs";

function certificateFile(path) {
  try { return readFileSync(path, "utf8"); }
  catch { throw new Error("PostgreSQL TLS certificate file cannot be read."); }
}

function validateCA(pem) {
  try {
    const certificates = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
    if (!certificates?.length || certificates.some(cert => !new X509Certificate(cert).ca)) throw new Error();
    return pem;
  } catch { throw new Error("PostgreSQL TLS CA must contain valid CA certificates in PEM format."); }
}

export function postgresTLSOptions(connectionString, environment = process.env) {
  if (!connectionString) throw new Error("DATABASE_URL is required for the Hostinger PostgreSQL runtime.");
  let url;
  try { url = new URL(connectionString); }
  catch { throw new Error("DATABASE_URL must be a valid PostgreSQL URL."); }
  if (!["postgresql:", "postgres:"].includes(url.protocol)) throw new Error("DATABASE_URL must be a PostgreSQL URL.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const local = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  const mode = url.searchParams.get("sslmode");
  if (!local && (["disable", "no-verify"].includes(mode) || ["false", "0"].includes(url.searchParams.get("ssl")) || url.searchParams.has("uselibpqcompat"))) {
    throw new Error("Remote PostgreSQL connections require verified TLS.");
  }
  // Local development keeps its prior non-TLS behavior unless TLS was requested.
  if (local && (!mode || mode === "disable") && !url.searchParams.has("ssl") && !url.searchParams.has("sslrootcert") && url.searchParams.get("sslnegotiation") !== "direct") {
    return { connectionString: url.href };
  }

  const rootFile = url.searchParams.get("sslrootcert") || environment.PGSSLROOTCERT;
  const inlineCA = environment.SYNAPSE_POSTGRES_CA_CERT;
  let ca;
  if (inlineCA || rootFile) {
    ca = [validateCA(inlineCA ? inlineCA.replace(/\\n/g, "\n") : certificateFile(rootFile))];
  } else if (hostname.endsWith(".supabase.co") || hostname.endsWith(".pooler.supabase.com")) {
    // Retain public/system trust (including newer pooler chains), adding only the
    // official Supabase private root, and only for Supabase database hostnames.
    const defaults = tls.getCACertificates ? tls.getCACertificates("default") : [...tls.rootCertificates];
    ca = [...defaults, supabaseRootCA];
    if (!tls.getCACertificates && environment.NODE_EXTRA_CA_CERTS) ca.push(certificateFile(environment.NODE_EXTRA_CA_CERTS));
  }
  const ssl = { rejectUnauthorized: true, minVersion: "TLSv1.2", ...(ca ? { ca } : {}) };
  if (!isIP(hostname)) ssl.servername = hostname;
  const certFile = url.searchParams.get("sslcert");
  const keyFile = url.searchParams.get("sslkey");
  if (certFile) ssl.cert = certificateFile(certFile);
  if (keyFile) ssl.key = certificateFile(keyFile);
  // pg parses these URL parameters after the supplied options and would replace
  // the entire ssl object, silently discarding our CA or hostname safeguards.
  const negotiation = url.searchParams.get("sslnegotiation");
  for (const parameter of ["ssl", "sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat", "sslnegotiation"]) url.searchParams.delete(parameter);
  return { connectionString: url.href, ssl, ...(negotiation ? { sslnegotiation: negotiation } : {}) };
}
