// Se importa el módulo Router de la biblioteca express, se usa para crear rutas modulares y manejarlas. Es como una mini aplicación que maneja sus propias rutas y middlewares.
import { Router } from "express";
// Se importa la API de promesas de fs, fs es el Módulo integrado que significa file system, nos sirve para manipular archivos y directorios, ya hace parte de node.js.
import { promises as fs } from "fs";
// Se importa el módulo path, nos permite trabajar con las rutas de los archivos y directorios. Permite construir rutas de manera consistente.
import path from 'path';
// Se importa la función fileURLToPath que convierte una url de archivo en una ruta de archivo.
import { fileURLToPath } from "url";


// Se crea el enrutador, se crea una instancia de un enrutador usando 'Router()' de Express. Este enrutador 'routerAnime' se utilizará para definir y manejar las rutas.
const routerAnime = Router();
// 'import.meta.url': Proporciona la URL del módulo actual y teniendo en cuenta que fileURLToPath pasa url a rutas, esta constante almacenará la ruta del archivo. 
const _filename = fileURLToPath(import.meta.url);
// _dirname almacenará la ruta del directorio que contiene el archivo actual.
const _dirname = path.dirname(_filename);
//animesFilePath almacenará la ruta para llegar a la base de datos, partiendo del archivo actual.
const animesFilePath = path.join(_dirname, "../../data/animes.json");

const readAnimesFs = async () => {
    try {
        const animes = await fs.readFile(animesFilePath, 'utf8')
        return JSON.parse(animes)
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`)
    }
}

const idGenerator = async () => {
    const animes = await readAnimesFs();
    if (animes.length == 0) return 1;
    const latestAnime = animes[(animes.length -1 )]
    return latestAnime.id + 1
};

const writeAnimesFs = async (animes) => {
    await fs.writeFile(animesFilePath, JSON.stringify(animes, null, 2));
};

routerAnime.post("/postAnimes", async (req, res) => {
    const animes = await readAnimesFs();
    const newAnime = {
        id: await idGenerator(),
        title: req.body.title,
        genre: req.body.genre,
        studioId: req.body.studioId
    };

    animes.push(newAnime);
    await writeAnimesFs(animes);
    res.status(201).send('Anime created succefully')
})

routerAnime.get("/", async (req, res) => {
    const animes = await readAnimesFs();
    res.json(animes);
})

routerAnime.get("/:id", async (req, res) => {
    const animes = await readAnimesFs();
    const anime = animes.find(a => a.id === parseInt(req.params.id));
    if (!anime) return res.status(404).send("Anime not found");
    res.json(anime)
});

routerAnime.put("/:id", async (req, res) => {
    const animes = await readAnimesFs();
    const animeIndex = animes.findIndex(a => a.id === parseInt(req.params.id));

    if (animeIndex === -1) return res.status(404).send("Anime not found");
    const updateAnime = {
        ...animes[animeIndex],
        title: req.body.title,
        genre: req.body.genre,
        studioId: req.body.studioId
    };

    animes[animeIndex] = updateAnime;
    await writeAnimesFs(animes);
    res.status(200).json({message: "Anime actualizado exitosamente!", anime:updateAnime})
});

routerAnime.delete("/delete/:id", async (req, res) => {
    let animes = await readAnimesFs();
    const anime = animes.find(a => a.id === parseInt(req.params.id));
    if (!anime) return res.status(404).send("Anime not found");
    animes = animes.filter(a => a.id !== anime.id);

    await writeAnimesFs(animes)
    res.send("Anime deleted succefully")
})

export default routerAnime
export { Router, fs, path, fileURLToPath }