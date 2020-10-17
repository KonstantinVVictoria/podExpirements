export default function GlobalStyles() {
  return (
    <style jsx global>
      {`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@100&display=swap");
        html,
        body {
          padding: 0;
          margin: 0;
          max-height: 100%;
          height: 100vh;
          width: 100%;
          background-color: rgb(25, 25, 25);
        }

        #__next {
          max-height: 100vh;
          height: 100%;
          width: 100%;
        }
      `}
    </style>
  );
}
