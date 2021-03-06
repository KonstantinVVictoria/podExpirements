import styles from "../styles/Home.module.css";
import LoadCS from "../components/LoadCS";
import GlobalStyles from "../components/globalStyles";
export default function Home() {
  const Player = LoadCS("player");
  return (
    <div className={styles.container}>
      <GlobalStyles />
      <Player
        id={1}
        serial={1}
        Style={{ height: 60, width: 300, padding: [0], borderSize: 4 }}
        src="test"
        img="blind-lights"
        title="Blinding Lights"
      />
      <Player
        id={2}
        serial={2}
        Style={{ height: 60, width: 300, padding: [0], borderSize: 4 }}
        src="dua"
        img="dua_lipa"
        title="Dont Stop Me Now"
      />
      <Player
        id={3}
        serial={3}
        Style={{ height: 60, width: 300, padding: [0], borderSize: 4 }}
        src="soarin"
        img="bazzi"
        title="Soarin"
      />
    </div>
  );
}
