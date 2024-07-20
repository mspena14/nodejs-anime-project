import { Router, fs, path, fileURLToPath } from "./animes.js";

const routerDirector = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const directoresFilePath = path.join(_dirname, "../../data/directores.json")

const readDirectoresFs = async () => {
    try {
        const directores = await fs.readFile(directoresFilePath, 'utf8');
        return JSON.parse(directores);
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`);
    }
};

const writeDirectoresFs = async (directores) => {
    await fs.writeFile(directoresFilePath, JSON.stringify(directores, null, 2));
};

const idGenerator = async () => {
    const directores = await readDirectoresFs();
    if (directores.length == 0) return 1;
    const latestDirector = directores[directores.length - 1]
    return latestDirector.id + 1
};

routerDirector.post("/postDirectores", async (req, res) => {
    const directores = await readDirectoresFs();
    const newDirector = {
        id: await idGenerator(),
        name: req.body.name
    };

    directores.push(newDirector);
    await writeDirectoresFs(directores);
    res.status(201).json({message: "Director agregado exitosamente!", estudio: newDirector})
});

routerDirector.get("/", async (req, res) => {
    const directores = await readDirectoresFs();
    res.json(directores)
});

routerDirector.get("/:id", async (req, res) => {
    const directores = await readDirectoresFs();
    const director = directores.find(director => director.id === parseInt(req.params.id));
    
    if (!director) return res.status(404).send("Director not found");
    res.json(director);
});

routerDirector.put("/:id", async (req, res) => {
    const directores = await readDirectoresFs();
    const directorIndex = directores.findIndex(director => director.id === parseInt(req.params.id));

    if (directorIndex === -1) return res.status(404).send("Director not found");
    const updateDirector = {
        ...directores[directorIndex],
        name: req.body.name
    };

    directores[directorIndex] = updateDirector;
    await writeDirectoresFs(directores);
    res.status(200).json({message: "Director actualizado exitosamente!", director:updateDirector});
});

routerDirector.delete("/delete/:id", async (req, res) => {
    let directores = await readDirectoresFs();
    const directorFound = directores.find(director => director.id === parseInt(req.params.id));

    if (!directorFound) return res.status(400).send("Director not found.");

    directores = directores.filter(director => director.id !== directorFound.id);
    await writeDirectoresFs(directores);
    res.send("Director deleted succefully");
});

export default routerDirector