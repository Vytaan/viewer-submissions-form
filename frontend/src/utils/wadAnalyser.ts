type LumpEntry = {
    name: string;
    offset: number;
    length: number;
};

type WadHeader = {
    identification: string;
    numLumps: number;
    infoTableOffset: number;
};

class WadMapTokenizer {
    private readonly tokens: Generator<[string, string]>;

    public constructor(lines: string[]) {
        this.tokens = this.init(lines);
    }

    private *init(lines: string[]): Generator<[string, string]> {
        let i = 0;
        while (i < lines.length) {
            let line = lines[i++].trim();

            while (line.length > 0) {
                if (line.startsWith('"')) {
                    const end = line.indexOf('"', 1);
                    if (end > 0) {
                        yield ["text", line.slice(1, end)];
                        line = line.slice(end + 1).trim();
                        continue;
                    }
                }

                if (line[0] === "{" || line[0] === "}" || line[0] === "=" || line[0] === ",") {
                    yield ["symbol", line[0]];
                    line = line.slice(1).trim();
                    continue;
                }

                const space = line.indexOf(" ");
                if (space > 0) {
                    yield ["text", line.slice(0, space)];
                    line = line.slice(space + 1).trim();
                    continue;
                }

                yield ["text", line];
                break;
            }
            yield ["symbol", "newline"];
        }
    }

    public *mapNameExtractorForUMAPINFO(): Generator<[string, string]> {
        let insideDeclarationState = 0;
        let insideBlockState = 0;

        let mapSlot = "";
        let key = "";
        let value = "";
        let error = false;

        for (const token of this.tokens) {
            if (insideDeclarationState > 0) {
                if (token[0] === "symbol") {
                    if (token[1] === "{") {
                        insideDeclarationState = 0;
                        insideBlockState = 1;
                        continue;
                    } else if (token[1] === "newline") {
                        insideDeclarationState = 0;
                        continue;
                    }
                }

                if (insideDeclarationState === 1) {
                    if (token[0] === "text") {
                        mapSlot = token[1];
                        insideDeclarationState = 2;
                    } else {
                        insideDeclarationState = 0;
                        mapSlot = "";
                    }
                }
            } else if (insideBlockState > 0) {
                if (token[0] === "symbol") {
                    if (token[1] === "}" || token[1] === "newline") {
                        if (mapSlot.length > 0 && key.toLocaleLowerCase() === "levelname" && value.length > 0) {
                            yield [mapSlot.toUpperCase(), value];
                        }

                        key = "";
                        value = "";

                        if (token[1] === "}") {
                            insideBlockState = 0;
                            mapSlot = "";
                        } else {
                            insideBlockState = 1;
                        }
                        continue;
                    }
                }

                error = false;
                switch (insideBlockState) {
                    case 1:
                        if (token[0] === "text") {
                            key = token[1];
                            insideBlockState = 2;
                        } else {
                            error = true;
                        }
                        break;
                    case 2:
                        if (token[0] === "text") {
                            key += " " + token[1];
                        } else if (token[1] === "=") {
                            insideBlockState = 3;
                        } else {
                            error = true;
                        }
                        break;
                    case 3:
                        if (token[0] === "text") {
                            value = token[1];
                            insideBlockState = 4;
                        } else {
                            error = true;
                        }
                        break;
                    case 4:
                        if (token[0] === "text") {
                            value += " " + token[1];
                        } else {
                            error = true;
                        }
                        break;
                }

                if (error) {
                    insideBlockState = 1;
                    key = "";
                    value = "";
                }
            } else {
                if (token[0] === "text" && token[1].toUpperCase() === "MAP") {
                    insideDeclarationState = 1;
                }
                if (token[0] === "symbol" && token[1] === "{") {
                    insideBlockState = 1;
                }
            }
        }
    }
}

class WadReader {
    public header: WadHeader;
    public lumpTable: LumpEntry[];
    private fileData: DataView;

    public constructor(data: DataView) {
        this.fileData = data;
        this.header = this.readHeader();
        this.lumpTable = this.readLumpTable();
    }

    private readHeader(): WadHeader {
        if (this.fileData.byteLength < 12) {
            throw new Error("Error: File too small to contain a header");
        }

        const identification = this.readString(0, 4);
        if (identification !== "IWAD" && identification !== "PWAD") {
            throw new Error("Error: not a IWAD or PWAD");
        }

        const numLumps = this.fileData.getInt32(4, true);
        const infoTableOffset = this.fileData.getInt32(8, true);

        if (this.fileData.byteLength < infoTableOffset + numLumps * 16) {
            throw new Error("Error: Header corrupt or file truncated");
        }

        return { identification, numLumps, infoTableOffset };
    }

    public readString(offset: number, length: number): string {
        let str = "";
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(this.fileData.getUint8(offset + i));
        }
        return str;
    }

    private readLumpTable(): LumpEntry[] {
        const lumpTable: LumpEntry[] = [];
        const header = this.header;
        for (let lumpIndex = 0; lumpIndex < header.numLumps; lumpIndex++) {
            const lumpOffset = header.infoTableOffset + lumpIndex * 16;
            const offset = this.fileData.getInt32(lumpOffset, true);
            const length = this.fileData.getInt32(lumpOffset + 4, true);
            const name = this.readString(lumpOffset + 8, 8).replace(/\0/g, "");
            lumpTable.push({ name, offset, length });
        }
        return lumpTable;
    }
}

const MAP_LUMPS: Record<string, boolean> = {
    THINGS: true,
    LINEDEFS: true,
    SIDEDEFS: true,
    VERTEXES: true,
    SECTORS: true,
    SEGS: false,
    SSECTORS: false,
    NODES: false,
    REJECT: false,
    BLOCKMAP: false,
};

export class WadMapAnalyser extends WadReader {
    private static isInternalConstructing = false;

    public constructor(data: DataView) {
        super(data);
        if (!WadMapAnalyser.isInternalConstructing) {
            throw new TypeError("PrivateConstructor is not constructable");
        }
        WadMapAnalyser.isInternalConstructing = false;
    }

    public get mapNames(): string[] {
        const mapNameFormats = this.findMapNameFormats();
        return this.getMapNames(mapNameFormats);
    }

    public static async create(file: File): Promise<WadMapAnalyser> {
        const buffer = await file.arrayBuffer();
        WadMapAnalyser.isInternalConstructing = true;
        try {
            return new WadMapAnalyser(new DataView(buffer));
        } catch (e) {
            WadMapAnalyser.isInternalConstructing = false;
            throw e;
        }
    }

    private findMapNameFormats(): Record<string, LumpEntry> {
        const mapNameFormats: Record<string, LumpEntry> = {};
        for (let i = 0; i < this.lumpTable.length; i++) {
            if (
                this.lumpTable[i].name === "DEHACKED" ||
                this.lumpTable[i].name === "MAPINFO" ||
                this.lumpTable[i].name === "UMAPINFO"
            ) {
                mapNameFormats[this.lumpTable[i].name] = this.lumpTable[i];
            }
        }
        return mapNameFormats;
    }

    private getMapFromLumps(): Record<string, string> {
        const maps: Record<string, string> = {};

        let lump = 0;
        while (lump < this.lumpTable.length) {
            const candidateMapSlot = this.lumpTable[lump++].name;

            let numMandatoryFound = 0;
            while (lump < this.lumpTable.length) {
                const lumpName = this.lumpTable[lump++].name;

                const mapLumpIsMandatory = MAP_LUMPS[lumpName] ?? null;
                if (mapLumpIsMandatory === null) {
                    lump--;
                    break;
                } else if (mapLumpIsMandatory) {
                    numMandatoryFound++;
                    if (numMandatoryFound === 5) {
                        maps[candidateMapSlot] = candidateMapSlot;
                    }
                }
            }
        }

        return maps;
    }

    private getMapFromDEHACKED(dehLump: LumpEntry, maps: Record<string, string>): void {
        const dehString = this.readString(dehLump.offset, dehLump.length);
        const lines = dehString.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.includes("HUSTR_")) {
                continue;
            }
            const split = line.indexOf("=");
            if (split < 0) {
                continue;
            }
            const hustr = line.slice(0, split).trim();
            const mapName = line.slice(split + 1).trim();
            const mapSlot = "MAP" + hustr.slice(6).padStart(2, "0");
            if (!maps[mapSlot]) {
                continue;
            }
            maps[mapSlot] = mapName;
        }
    }

    private getMapFromMAPINFO(mapiLump: LumpEntry, maps: Record<string, string>): void {
        const mapiString = this.readString(mapiLump.offset, mapiLump.length);
        const lines = mapiString.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.slice(0, 4).toUpperCase() !== "MAP ") {
                continue;
            }
            const content = line.slice(4).trim();
            if (content.includes("lookup")) {
                continue;
            }

            const space = content.indexOf(" ");
            if (space < 0) {
                continue;
            }
            const mapSlot = content.slice(0, space).toUpperCase();
            if (!maps[mapSlot]) {
                continue;
            }

            let mapName = content.slice(space + 1).trim();

            if (mapName[0] === '"') {
                for (let j = 1; j < mapName.length; j++) {
                    if (mapName[j] === '"') {
                        mapName = mapName.slice(1, j).trim();
                        break;
                    }
                }
            } else {
                const brace = mapName.indexOf("{");
                if (brace > 0) {
                    mapName = mapName.slice(0, brace).trim();
                }
            }

            maps[mapSlot] = mapName;
        }
    }

    private getMapFromUMAPINFO(umapLump: LumpEntry, maps: Record<string, string>): void {
        const umapString = this.readString(umapLump.offset, umapLump.length);
        const lines = umapString.split("\n");
        const wadTokenizer = new WadMapTokenizer(lines);
        const mapSlotsAndNames = wadTokenizer.mapNameExtractorForUMAPINFO();

        for (const mapSlotAndName of mapSlotsAndNames) {
            if (maps[mapSlotAndName[0]]) {
                maps[mapSlotAndName[0]] = mapSlotAndName[1];
            }
        }
    }

    private removeQuotesIfNecessary(maps: Record<string, string>): void {
        const keys = Object.keys(maps);
        for (let i = 0; i < keys.length; i++) {
            const mapName = maps[keys[i]];
            if (mapName[0] === '"' && mapName[mapName.length - 1] === '"') {
                maps[keys[i]] = mapName.slice(1, mapName.length - 1);
            }
        }
    }

    private addMapSlotsToNameIfNecessary(maps: Record<string, string>): void {
        const keys = Object.keys(maps);
        for (let i = 0; i < keys.length; i++) {
            const mapName = maps[keys[i]];
            if (!mapName.toUpperCase().includes(keys[i].toUpperCase())) {
                maps[keys[i]] = keys[i] + ": " + mapName;
            }
        }
    }

    private getMapNames(mapNameFormats: Record<string, LumpEntry>): string[] {
        const maps = this.getMapFromLumps();

        if (mapNameFormats["DEHACKED"]) {
            this.getMapFromDEHACKED(mapNameFormats["DEHACKED"], maps);
        }

        if (mapNameFormats["MAPINFO"]) {
            this.getMapFromMAPINFO(mapNameFormats["MAPINFO"], maps);
        }

        if (mapNameFormats["UMAPINFO"]) {
            this.getMapFromUMAPINFO(mapNameFormats["UMAPINFO"], maps);
        }

        this.removeQuotesIfNecessary(maps);
        this.addMapSlotsToNameIfNecessary(maps);

        return Object.values(maps).sort();
    }
}
