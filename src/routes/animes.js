import { Router } from "express";
import { promises as fs } from "fs";
import path from 'path';
import { fileURLToPath } from "url";

const routerAnime = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const animesFilePath = path.join(_dirname, "../../data/animes.json");

const readAnimesFs = async () => {
    try {
        const animes = await fs.readFile(animesFilePath, 'utf8')
        return JSON.parse(animes)
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`)
    }
}

const writeAnimesFs = async (animes) => {
    await fs.writeFile(animesFilePath, JSON.stringify(animes, null, 2));
};

routerAnime.post("/postAnimes", async (req, res) => {
    const animes = await readAnimesFs();
    const newAnime = {
        id: animes.length + 1,
        title: req.body.title,
        genre: req.body.genre
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