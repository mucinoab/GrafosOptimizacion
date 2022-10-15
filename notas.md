# Ideas de Desarrollo
  - [X] Arreglar CI para que haga el push y deploy completo, ahorita no hace push correctamente.
  - [X]  Editor de grafos.
  - [~X] Buen posicionamiento y diseño de gráficas. 
  - [X] arreglar go vet
  - [X] go vet ponerlo en CI
  - [X] dibujar grafos hacia abajo cuando es un celular o pantalla angosta. 
  - [X] sombra en hover sobre los métodos (nav bar izq)
  - [X] Modificar tablas una vez ya creadas(añadir, quitar filas).
  - [X] Reducir go lint warnings.

  - [ ] Grafos interactivos https://github.com/oslabs-beta/Svelvet
  - [ ] https://nolanlawson.com/2021/08/08/improving-responsiveness-in-text-inputs/
  - [ ] Implementar algoritmo de prim con animación y toda la onda
  - [ ] Poder subir importar/exportar los grafos que se dan (formatos? Chance el dot-eso), exportar como imagen/svg
  - [ ] Arreglar estilo y posicionamiento de botón para agregar y quitar filas.
  - [ ] Cdn deliver tracking privacy badger, eliminar ?? creo que no trackean nada, googleada inconclusa
  - [-] Grpc go brrrrrr
  - [ ] Dark mode
  - [ ] Hacer que grafo generado pueda ser click-derecheado para guardar imagen
  - [ ] Errores de dibujo desaparecen. ?????
  - [ ] Alto consumo de energía ?? se puede ver en el "htop" del navegador
  - [ ] Más tests (todas las tareas de Haro)
  - [ ] Documentar código (que pueda ser utilizado como un recurso de aprendizaje por novatos)
  - [ ] Animación Dijkstra u otros algoritmos.
  - [ ] Bajar grafos como dot-language.
  - [ ] Bajar grafos como imagen.
  - [ ] Click en la imagen para hacer más grande 
  - [ ] Botón para generar grafo de problema recién resuelto. 
  - [ ] Bajar/visualizar grafos como ascii art https://dot-to-ascii.ggerganov.com/
  - [ ] Hacer los ejemplos más simples, pequeños y concisos.
  - [ ] Distributed tracing. or more specific spans
  - [ ] Dejar claro que el api rest es publica, se puede utilizar, tal vez agregar una colección de postman

  - [ ] Perma links a una solución específica, url query string
    - [ ] al picarle que solucione, solucionar de manera normal pero en un gorutine
      guardar los contenidos y mandar de regreso el url generado, de esta
      manera se puede copiar directamente el url y compartir la solución.

      Esto significa que cada respuesta se tiene que almacenar dentro de redis,
      lo cual no es necesariamente factible, a lo mejor con un tiempo de vida
      de 90(?) días puede que sí o comprimiendo el contenido. Además los
      servicios que ofrece heroku no tienen un redis con memoria persistente
      por lo que no es un método de almacenamiento 

    - [ ] Botón de compartir que solo copie ese url al clipboard y avise al usuario que se ha copiado.
    - [ ] error cuando url de getPermaData() no funciona, el link esta mal o los datos no están en la db.
    - [ ] validar tabla
    - [ ] hash json  
    - [ ] guardar en redis key: hash, value: json
    - [ ] regresar hash
    - [ ] http://localhost:8000/getperma?method=kruskal&id=af542c6a69761901df47916cd238feaabbc1bc8d4d920a89858d6dcc2535aa91
    - [X] que el permalink te lleve a la pagina principal
    - [X] con js analizar el url, sacar el hash del problema
    - [X] consultar le json del probelma
    - [X] camiar a la pestaña requerida 
    - [ ] llamar a la función requerida


