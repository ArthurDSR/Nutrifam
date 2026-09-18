# Fontes do catálogo de alimentos

Coloque aqui os arquivos originais de TBCA, USDA ou fabricantes. Os arquivos brutos não são carregados pelo aplicativo; o importador gera `src/data/generatedFoodCatalog.json`.

## Importação

```powershell
npm run food-db:import -- --input=data/food-sources/arquivo.csv --source=tbca
npm run food-db:import -- --input=data/food-sources/arquivo.json --source=usda
npm run food-db:import -- --input=data/food-sources/fabricante.csv --source=manufacturer
```

O CSV pode usar vírgula ou ponto e vírgula e nomes de colunas em português ou inglês. JSON exportado pela USDA também pode usar `foodNutrients`. Para produtos industrializados, use o modelo `manufacturer-template.csv`; o código de barras é a chave preferencial de deduplicação.

Cada execução mescla os registros aceitos com o catálogo gerado. O relatório em `import-report.json` lista totais e rejeições. Registros de fabricantes entram como `pending` até revisão, enquanto fontes oficiais entram como `verified`.

Antes de importar uma fonte, registre sua licença e versão. Não distribua arquivos cuja licença proíba redistribuição.
