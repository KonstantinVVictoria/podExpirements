import dynamic from "next/dynamic";

export default function LoadCS(component) {
  return dynamic(() => import(`./${component}.jsx`), {
    ssr: false,
  });
}
