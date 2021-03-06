import { SomeSQL } from "some-sql";
import { Promise } from "es6-promise";

export interface Path {
    id: number;
    color: string;
    size: number;
    path: {
        x: number,
        y: number
    }[]
}

export const DrawStore = (): Promise<any> => {
    SomeSQL("paths")
    .model([
        {key: "id", type: "int", props: ["pk()"]},
        {key: "color", type: "string"},
        {key: "size", type: "int"},
        {key: "path", type: "array"}
    ])

    return SomeSQL().config({persistent:true}).connect();
}
