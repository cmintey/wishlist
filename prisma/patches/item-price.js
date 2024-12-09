import { PrismaClient } from "@prisma/client";

const PATCH_ID = "item-price";
const prisma = new PrismaClient();

const isPatchApplied =
    (await prisma.patch.findUnique({
        where: {
            id: PATCH_ID
        }
    })) !== null;

if (isPatchApplied) {
    console.log("Skipping already applied patch: '%s'", PATCH_ID);
} else {
    const symbolToCurrencyMap = {
        $: "USD",
        "€": "EUR",
        "£": "GBP",
        "¥": "JPY"
    };

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

    await prisma.patch.create({
        data: {
            id: PATCH_ID
        }
    });
    console.log("Patch '%s' applied successfully.", PATCH_ID);
}

await prisma.$disconnect();
