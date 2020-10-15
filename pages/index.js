import styles from "../styles/Home.module.css";
import LoadCS from "../components/LoadCS";
export default function Home() {
  const Player = LoadCS("player");
  return (
    <div className={styles.container}>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          maxheight: 100%;
          height: 100vh;
          width: 100%;
        }

        #__next {
          maxheight: 100vh;
          height: 100%;
          width: 100%;
        }
      `}</style>
      <Player id={1} serial={1} />
    </div>
  );
}
