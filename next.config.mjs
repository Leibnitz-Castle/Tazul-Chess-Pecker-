/** @type {import('next').NextConfig} */
const nextConfig = {
  // @lichess-org/pgn-viewer and its deps (snabbdom, @lichess-org/chessground) are
  // pure ESM packages — webpack requires transpilePackages to bundle them correctly.
  transpilePackages: [
    '@lichess-org/pgn-viewer',
    '@lichess-org/chessground',
    'snabbdom',
    'chessops',
  ],
};

export default nextConfig;
