import { Router } from "express";
import { promises as fs } from "fs";
import path from 'path';
import { fileURLToPath } from "url";

const routerEstudio = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const estudiosFilePath = path.join(_dirname, "../../data/estudios.json");

const readEstudiosFs = async () => {
    try {
        const estudios = await fs.readFile(estudiosFilePath, 'utf8')
        return JSON.parse(estudios)
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`)
    }
}

const writeEstudiosFs = async (estudios) => {
    await fs.writeFile(estudiosFilePath, JSON.stringify(estudios, null, 2));
};

routerEstudio.post("/postestudios", async (req, res) => {
    const estudios = await readEstudiosFs();
    const newAnime = {
        id: estudios.length + 1,
        title: req.body.title,
        genre: req.body.genre
    };

    estudios.push(newAnime);
    await writeEstudiosFs(estudios);
    res.status(201).send('Anime created succefully')
})

routerEstudio.get("/", async (req, res) => {
    const estudios = await readEstudiosFs();
    res.json(estudios);
})

routerEstudio.get("/:id", async (req, res) => {
    const estudios = await readEstudiosFs();
    const anime = estudios.find(a => a.id === parseInt(req.params.id));
    if (!anime) return res.status(404).send("Anime not found");
    res.json(anime)
});

routerEstudio.put("/:id", async (req, res) => {
    const estudios = await readEstudiosFs();
    const animeIndex = estudios.findIndex(a => a.id === parseInt(req.params.id));

    if (animeIndex === -1) return res.status(404).send("Anime not found");
    const updateAnime = {
        ...estudios[animeIndex],
        title: req.body.title,
        genre: req.body.genre,
    };

    estudios[animeIndex] = updateAnime;
    await writeEstudiosFs(estudios);
    res.status(200).json({message: "Anime actualizado exitosamente!", anime:updateAnime})
});

routerEstudio.delete("/delete/:id", async (req, res) => {
    let estudios = await readEstudiosFs();
    const anime = estudios.find(a => a.id === parseInt(req.params.id));
    if (!anime) return res.status(404).send("Anime not found");
    estudios = estudios.filter(a => a.id !== anime.id);

    await writeEstudiosFs(estudios)
    res.send("Anime deleted succefully")
})

export default routerEstudio