import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname en la parte superior del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
};

export default nextConfig;
