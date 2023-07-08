import solid from "solid-start/vite";
import { defineConfig } from "vite";
import prpc from "@prpc/vite";import path from "path";
  
export default defineConfig(() => {
  return {
    plugins: [prpc(), solid({ ssr: true })],
    resolve: {
      alias: {
        rpc: path.join(__dirname, "src", "server", "api"),
      },
    },
  };
});
  
