# Fontes do catálogo de alimentos

Coloque aqui os arquivos originais de TBCA, USDA ou fabricantes. Os arquivos brutos não são carregados pelo aplicativo; o importador gera `src/data/generatedFoodCatalog.json`.

## Importação

```powershell
npm run food-db:import -- --input=data/food-sources/arquivo.csv --source=tbca
npm run food-db:import -- --input=data/food-sources/arquivo.json --source=usda
npm run food-db:import -- --input=data/food-sources/fabricante.csv --source=manufacturer
```

O CSV pode usar vírgula ou ponto e vírgula e nomes de colunas em português ou inglês. JSON exportado pela USDA também pode usar `foodNutrients`. Para produtos industrializados, use o modelo `manufacturer-template.csv`; o código de barras é a chave preferencial de deduplicação.

Cada execução substitui o lote anterior da mesma fonte, exceto fabricantes. Os lotes de fabricantes são acumulados por GTIN, de modo que a importação de uma empresa preserve os produtos já cadastrados de outras. O relatório em `import-report.json` lista totais e rejeições.

## Lotes por fabricante

O lote de grãos da Solito (incluindo Vitabon) e da Patéko registra cada embalagem por GTIN e mantém o link da ficha oficial. As quantidades nutricionais são por porção em gramas do produto cru, conforme as fichas.

```powershell
npm run food-db:import -- --input=data/food-sources/manufacturers/graos-solito-pateko.json --source=manufacturer --verified-labels --report=data/food-sources/manufacturers/graos-solito-pateko-report.json
```

Para novos lotes, confira a variante, o GTIN da embalagem de venda e os valores da mesma coluna da tabela nutricional. Registre a ficha oficial em `sourceUrl`. Use `--verified-labels` depois dessa conferência. O importador rejeita GTIN com dígito verificador inválido e campos nutricionais ausentes.

## Coleta de rótulos no mercado

Abra a aba de código de barras e escolha **Cadastrar produto pelo rótulo**. Você pode escanear ou digitar o GTIN. Com um provedor de IA configurado, a foto da tabela preenche os campos para revisão. O preenchimento manual também funciona. Confira a marca, a variante, a unidade e todos os números da mesma coluna antes de salvar.

Os produtos ficam em **Meus alimentos** e podem ser consultados pelo GTIN na mesma conta. Use **Exportar rótulos cadastrados** na aba do leitor para obter o JSON e encaminhá-lo para revisão antes de inclusão no catálogo compartilhado. Para bebidas, preserve a porção em ml no campo `servingSize`.

## Preparações compostas

Pizza, pastel, coxinha, PF, sanduíches e outras preparações variáveis não entram como alimentos genéricos. Elas são aceitas apenas em dois casos:

- receita com ingredientes, quantidades e rendimento completos;
- produto embalado com marca e código de barras.

Assim, “Pizza de pizzaria tradicional” é rejeitada, mas uma pizza congelada identificada por GTIN ou uma receita calculada pelo próprio usuário pode ser usada.

Antes de importar uma fonte, registre sua licença e versão. Não distribua arquivos cuja licença proíba redistribuição.

As fontes aprovadas e seus limites de uso estão em `source-registry.json`. A prioridade é TBCA para alimentos brasileiros simples e USDA Foundation Foods para preencher lacunas. Bases de consumo e receitas genéricas, como FNDDS, não são importadas integralmente.
