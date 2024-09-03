import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roles = async () => {
    await prisma.role.upsert({
        where: {
            id: 1
        },
        create: {
            id: 1,
            name: "USER"
        },
        update: {}
    });

    await prisma.role.upsert({
        where: {
            id: 2
        },
        create: {
            id: 2,
            name: "ADMIN"
        },
        update: {}
    });

    await prisma.role.upsert({
        where: {
            id: 3
        },
        create: {
            id: 3,
            name: "GROUP_MANAGER"
        },
        update: {}
    });

    console.log("roles are synced");
};

const groups = async () => {
    const groupCount = await prisma.group.count();

    if (groupCount === 0) {
        const defaultGroup = await prisma.group.create({
            data: {
                name: "Default"
            }
        });

        const allUsers = await prisma.user.findMany();
        for (const user of allUsers) {
            await prisma.userGroupMembership.create({
                data: {
                    active: true,
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    group: {
                        connect: {
                            id: defaultGroup.id
                        }
                    }
                }
            });
        }

        const allItems = await prisma.item.findMany();
        for (const item of allItems) {
            await prisma.item.update({
                where: {
                    id: item.id
                },
                data: {
                    group: {
                        connect: {
                            id: defaultGroup.id
                        }
                    }
                }
            });
        }
        console.log("created default group");
    } else {
        console.log("skipping default group creation");
    }
};

const symbolToCurrencyMap = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY"
};

const patchPrice = async () => {
    console.log("Patching item price model");
    const itemsWithPrice = await prisma.item.findMany({
        where: {
            price: {
                not: null
            },
            itemPriceId: null
        }
    });

    console.log("%d items to update", itemsWithPrice.length);
    itemsWithPrice.forEach(async (item) => {
        console.log("Patching item %s with price %s", item.name, item.price);
        const commaGroupSepRegex = /^(\d{0,3}\\,\d{3}){0,}\d{0,}\.?\d{0,2}$/g;
        const dotGroupSepRegex = /^(\d{0,3}\.\d{3}){0,}\d{0,},?\d{0,2}$/g;

        const price = item.price;
        const priceWithoutSymbols = /[\d\\.\\,]+/g.exec(price)?.[0]?.trim();
        const symbol = /[^\\,\\.\d\w\s]/g.exec(price)?.[0];
        let currency;
        let newPriceValue;
        if (symbol && symbolToCurrencyMap[symbol]) {
            currency = symbolToCurrencyMap[symbol];
            console.log("Detected currency as %s", currency);
        } else {
            currency = process.env.DEFAULT_CURRENCY || "USD";
            console.log("No currency detected, defaulting to %s", currency);
        }

        if (!priceWithoutSymbols) {
            return;
        }

        if (commaGroupSepRegex.test(priceWithoutSymbols)) {
            // price is a number with comma as the group separator
            console.log("Price detected as using group separator ',' and decimal separator '.'");
            const priceWithoutSep = priceWithoutSymbols.replace(",", "");
            console.log("price without separator: %s", priceWithoutSep);
            if (priceWithoutSep.includes(".")) {
                // has decimal value
                const floatVal = parseFloat(priceWithoutSep);
                console.log("float value: %s", floatVal);
                newPriceValue = floatVal * 100;
            } else {
                newPriceValue = parseInt(priceWithoutSep) * 100;
            }
        }
        if (dotGroupSepRegex.test(priceWithoutSymbols)) {
            // price is a number with a dot as the group seperator
            console.log("Price detected as using group separator '.' and decimal separator ','");
            const priceWithoutSep = priceWithoutSymbols.replace(".", "");
            if (priceWithoutSep.includes(",")) {
                // has decimal value
                const floatVal = parseFloat(priceWithoutSep.replace(",", "."));
                newPriceValue = floatVal * 100;
            } else {
                newPriceValue = parseInt(priceWithoutSep) * 100;
            }
        }

        if (!newPriceValue) {
            console.log("Unable to determine price value\n");
            return;
        } else {
            console.log("New price value: %s\n", newPriceValue);
        }

        try {
            await prisma.item.update({
                where: {
                    id: item.id
                },
                data: {
                    itemPrice: {
                        create: {
                            currency,
                            value: newPriceValue
                        }
                    }
                }
            });
        } catch (e) {
            console.warn("Unable to update item with new price model", e);
        }
    });
    console.log("Finished patching item price model");
};

const main = async () => {
    await roles();
    await groups();
    await patchPrice();
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);

        await prisma.$disconnect();
        process.exit(1);
    });
