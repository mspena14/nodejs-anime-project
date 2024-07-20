import { Router, fs, path, fileURLToPath } from "./animes.js";

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
};

const idGenerator = async () => {
    const estudios = await readEstudiosFs();
    if (estudios.length == 0) return 1;
    const latestEstudio = estudios[(estudios.length -1 )]
    return latestEstudio.id + 1
};

const writeEstudiosFs = async (estudios) => {
    await fs.writeFile(estudiosFilePath, JSON.stringify(estudios, null, 2));
};

routerEstudio.post("/postEstudios", async (req, res) => {
    const estudios = await readEstudiosFs();
    const newEstudio = {
        id: await idGenerator(),
        name: req.body.name
    };

    estudios.push(newEstudio);
    await writeEstudiosFs(estudios);
    res.status(201).send('Estudio created succefully')
})

routerEstudio.get("/", async (req, res) => {
    const estudios = await readEstudiosFs();
    res.json(estudios);
})

routerEstudio.get("/:id", async (req, res) => {
    const estudios = await readEstudiosFs();
    const estudio = estudios.find(a => a.id === parseInt(req.params.id));
    
    if (!estudio) return res.status(404).send("Estudio not found");
    res.json(estudio)
});

routerEstudio.put("/:id", async (req, res) => {
    const estudios = await readEstudiosFs();
    const estudioIndex = estudios.findIndex(a => a.id === parseInt(req.params.id));

    if (estudioIndex === -1) return res.status(404).send("Estudio not found");
    const updateEstudio = {
        ...estudios[estudioIndex],
        name: req.body.name
    };

    estudios[estudioIndex] = updateEstudio;
    await writeEstudiosFs(estudios);
    res.status(200).json({message: "Estudio actualizado exitosamente!", estudio:updateEstudio})
});

routerEstudio.delete("/delete/:id", async (req, res) => {
    let estudios = await readEstudiosFs();
    const estudio = estudios.find(a => a.id === parseInt(req.params.id));

    if (!estudio) return res.status(404).send("Estudio not found");
    estudios = estudios.filter(a => a.id !== estudio.id);

    await writeEstudiosFs(estudios)
    res.send("Estudio deleted succefully")
})

export default routerEstudio