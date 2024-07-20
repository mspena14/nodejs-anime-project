import { Router, fs, path, fileURLToPath } from "./animes.js";

const routerCharacter = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const charactersFilePath = path.join(_dirname, "../../data/characters.json")

const readCharactersFs = async () => {
    try {
        const characters = await fs.readFile(charactersFilePath, 'utf8');
        return JSON.parse(characters);
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`);
    }
};

const writeCharactersFs = async (characters) => {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2));
};

const idGenerator = async () => {
    const characters = await readCharactersFs();
    if (characters.length == 0) return 1;
    const latestCharacter = characters[characters.length - 1]
    return latestCharacter.id + 1
};

routerCharacter.post("/postCharacters", async (req, res) => {
    const characters = await readCharactersFs();
    const newCharacter = {
        id: await idGenerator(),
        name: req.body.name,
        animeId: req.body.animeId
    };

    characters.push(newCharacter);
    await writeCharactersFs(characters);
    res.status(201).json({message: "Character agregado exitosamente!", estudio: newCharacter})
});

routerCharacter.get("/", async (req, res) => {
    const characters = await readCharactersFs();
    res.json(characters)
});

routerCharacter.get("/:id", async (req, res) => {
    const characters = await readCharactersFs();
    const character = characters.find(character => character.id === parseInt(req.params.id));
    
    if (!character) return res.status(404).send("Character not found");
    res.json(character);
});

routerCharacter.put("/:id", async (req, res) => {
    const characters = await readCharactersFs();
    const directorIndex = characters.findIndex(character => character.id === parseInt(req.params.id));

    if (directorIndex === -1) return res.status(404).send("Character not found");
    const updateCharacter = {
        ...characters[directorIndex],
        name: req.body.name,
        animeId: req.body.animeId
    };

    characters[directorIndex] = updateCharacter;
    await writeCharactersFs(characters);
    res.status(200).json({message: "Character actualizado exitosamente!", character:updateCharacter});
});

routerCharacter.delete("/delete/:id", async (req, res) => {
    let characters = await readCharactersFs();
    const directorFound = characters.find(character => character.id === parseInt(req.params.id));

    if (!directorFound) return res.status(400).send("Character not found.");

    characters = characters.filter(character => character.id !== directorFound.id);
    await writeCharactersFs(characters);
    res.send("Character deleted succefully");
});

export default routerCharacter