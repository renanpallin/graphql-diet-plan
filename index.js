// https://github.com/raulfdm/taco-api
const tacoData = require("./data/taco.json");

const { PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD, PG_PORT = 5432, PG_SSL = true } = process.env;

const Pool = require("pg").Pool;
const client = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASSWORD,
    port: PG_PORT,
    ssl: PG_SSL,
});

client.connect().then(() => {
    const promises = tacoData.map(food => {
        const macros = ["protein_g", "lipid_g", "carbohydrate_g"];
        macros.map(macro =>
            typeof food[macro] != "number" ? (food[macro] = 0) : null
        );
        return client
            .query(
                "INSERT INTO taco (id, description, protein_g, lipid_g, carbohydrate_g) VALUES ($1, $2, $3, $4, $5);",
                [
                    food.id,
                    food.description,
                    food.protein_g,
                    food.lipid_g,
                    food.carbohydrate_g,
                ]
            )
            .then(result => {
                console.log(
                    `${food.id} ${food.description} inserido:`,
                    result.rowCount
                );
            })
            .catch(error => {
                if (error.code == 23505) {
                    return console.log(
                        `${food.id} ${food.description} já está inserida`
                    );
                }
                console.error(error);
                // process.exit();
            });
    });
    console.log("montamos a promise", promises);
    Promise.all(promises)
        .then(() => {
            console.log("done!");
        })
        .catch(e => console.error("erro =(", error));

    // client.query("SELECT * FROM taco", [], (error, results) => {
    //     if (error) {
    //         console.error(error);
    //         process.exit();
    //     }
    //     // console.log(results.rows);
    // });
});
// postgres://xhpctrbnxxzdol:b923fc7c3c2526879176916b0207f8b41cb7b6eb58ac37b718e467de25f7b0d5@ec2-54-235-114-242.compute-1.amazonaws.com:5432/d28pmjk7poa66o

// tacoData.map(data => {
//     console.log(data)
//     process.exit()
// })
