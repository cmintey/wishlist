UPDATE items
SET price = '$' || price
WHERE price <> '' AND price NOT LIKE '$%'