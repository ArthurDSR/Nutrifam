import React from 'react';

interface MealIconProps {
  className?: string;
}

export const BreakfastIcon: React.FC<MealIconProps> = ({ className = 'w-full h-full' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    className={className}
    role="img"
    aria-label="Café da Manhã"
  >
    {/* Sombra suave para o pires */}
    <ellipse cx="200" cy="355" rx="140" ry="12" fill="#E2E8F0" opacity="0.6" />

    {/* Pires */}
    <g id="saucer">
      {/* Prato externo */}
      <ellipse
        cx="200"
        cy="325"
        rx="150"
        ry="38"
        fill="#E8F5E9"
        stroke="#688F80"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Linha interna de profundidade do prato */}
      <ellipse
        cx="200"
        cy="327"
        rx="115"
        ry="24"
        fill="#F4FAF6"
        stroke="#94BCAE"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>

    {/* Asa da Xícara */}
    <g id="cup-handle">
      <path
        d="M 280 200 C 335 200 335 270 270 278"
        fill="none"
        stroke="#688F80"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M 280 200 C 335 200 335 270 270 278"
        fill="none"
        stroke="#7BAE7F"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </g>

    {/* Corpo da Xícara */}
    <g id="cup-body">
      {/* Forma principal arredondada */}
      <path
        d="M 105 170 C 110 295, 150 315, 200 315 C 250 315, 290 295, 295 170 Z"
        fill="#A5D6A7"
        stroke="#688F80"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Brilho / Destaque suave na lateral da xícara */}
      <path
        d="M 125 185 C 130 265, 155 292, 185 298 C 160 290, 140 265, 138 185 Z"
        fill="#C8E6C9"
        opacity="0.7"
      />

      {/* Borda externa da boca da xícara */}
      <ellipse cx="200" cy="170" rx="95" ry="30" fill="#C8E6C9" stroke="#688F80" strokeWidth="7" />

      {/* Café interno */}
      <ellipse cx="200" cy="172" rx="80" ry="22" fill="#D7A86E" stroke="#8C6541" strokeWidth="4" />
      <ellipse cx="200" cy="172" rx="68" ry="17" fill="#C59356" />

      {/* Espuma / Arte Latte suave */}
      <path
        d="M 175 168 C 185 160, 215 160, 225 168 C 235 176, 210 184, 200 180 C 190 176, 165 176, 175 168 Z"
        fill="#F5EBE1"
        opacity="0.85"
        stroke="#A67C52"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>

    {/* Colher em tom pastel apoiada no pires */}
    <g id="spoon" transform="rotate(-18 135 320)">
      {/* Cabo */}
      <path d="M 75 320 Q 120 321 160 320" fill="none" stroke="#688F80" strokeWidth="12" strokeLinecap="round" />
      <path d="M 75 320 Q 120 321 160 320" fill="none" stroke="#E0E7E9" strokeWidth="6" strokeLinecap="round" />
      {/* Bojo da colher */}
      <ellipse cx="70" cy="320" rx="20" ry="12" fill="#EDF2F4" stroke="#688F80" strokeWidth="5" />
      <ellipse cx="70" cy="320" rx="14" ry="7" fill="#CBD5E1" />
    </g>

    {/* Vapor estilizado e aromático */}
    <g id="steam" fill="none" stroke="#F6BD60" strokeWidth="5" strokeLinecap="round" opacity="0.85">
      <path d="M 165 130 C 150 110, 175 95, 160 75 C 150 62, 158 52, 165 45" />
      <path d="M 200 125 C 215 105, 185 85, 205 60 C 212 51, 208 42, 202 35" strokeWidth="6" stroke="#F5CAC3" />
      <path d="M 235 132 C 220 112, 245 98, 230 78 C 222 67, 230 58, 235 50" />
    </g>
  </svg>
);

export const LunchIcon: React.FC<MealIconProps> = ({ className = 'w-full h-full' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    className={className}
    role="img"
    aria-label="Almoço"
  >
    {/* Sombra suave da base do prato */}
    <ellipse cx="200" cy="225" rx="145" ry="140" fill="#E2E8F0" opacity="0.7" />

    {/* Talheres */}
    <g id="cutlery">
      {/* Garfo (Esquerda) */}
      <g id="fork">
        <path
          d="M 42 280 C 42 295, 48 300, 48 340 C 48 348, 38 348, 38 340 C 38 300, 32 295, 32 280 L 32 170 C 32 165, 38 165, 38 170 L 38 215 C 38 218, 42 218, 42 215 L 42 170 C 42 165, 48 165, 48 170 L 48 215 C 48 218, 52 218, 52 215 L 52 170 C 52 165, 58 165, 58 170 L 58 280 Z"
          fill="#CBD5E1"
          stroke="#688F80"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>

      {/* Faca (Direita) */}
      <g id="knife">
        {/* Cabo */}
        <path
          d="M 355 240 L 361 340 C 361 348, 351 348, 351 340 L 345 240 Z"
          fill="#CBD5E1"
          stroke="#688F80"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Lâmina com corte pastel */}
        <path
          d="M 345 240 C 345 190, 348 165, 362 165 C 362 205, 355 220, 355 240 Z"
          fill="#E2E8F0"
          stroke="#688F80"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>
    </g>

    {/* Prato Principal */}
    <g id="plate">
      {/* Aba externa */}
      <circle cx="200" cy="215" r="135" fill="#FCE7D0" stroke="#D4A373" strokeWidth="6" />
      {/* Fundo interno */}
      <circle cx="200" cy="215" r="108" fill="#FFFDF9" stroke="#E9D5C3" strokeWidth="4" />
    </g>

    {/* Comida */}
    <g id="food">
      {/* Porção de Feijão (marrom pastel avermelhado) */}
      <g id="beans">
        <path
          d="M 125 185 C 145 155, 185 160, 195 190 C 200 215, 175 235, 150 235 C 120 235, 110 205, 125 185 Z"
          fill="#DDB892"
          stroke="#A98467"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Grãos destacados */}
        <ellipse cx="145" cy="185" rx="8" ry="5" transform="rotate(-20 145 185)" fill="#B08968" />
        <ellipse cx="165" cy="205" rx="7" ry="5" transform="rotate(30 165 205)" fill="#B08968" />
        <ellipse cx="140" cy="210" rx="7" ry="4.5" transform="rotate(-10 140 210)" fill="#B08968" />
        <ellipse cx="175" cy="185" rx="6" ry="4" transform="rotate(45 175 185)" fill="#B08968" />
      </g>

      {/* Porção de Arroz (branco/marfim pastel fofinho) */}
      <g id="rice">
        <path
          d="M 165 145 C 180 135, 220 135, 235 150 C 255 170, 245 205, 225 215 C 205 220, 180 205, 170 195 C 155 180, 150 160, 165 145 Z"
          fill="#F8F9FA"
          stroke="#CBD5E1"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Textura de grãozinhos */}
        <ellipse cx="190" cy="155" rx="4" ry="2" fill="#E2E8F0" />
        <ellipse cx="215" cy="165" rx="4" ry="2" transform="rotate(25 215 165)" fill="#E2E8F0" />
        <ellipse cx="185" cy="180" rx="4" ry="2" transform="rotate(-20 185 180)" fill="#E2E8F0" />
        <ellipse cx="210" cy="190" rx="4" ry="2" transform="rotate(10 210 190)" fill="#E2E8F0" />
        <ellipse cx="230" cy="180" rx="4" ry="2" transform="rotate(60 230 180)" fill="#E2E8F0" />
      </g>

      {/* Filé de Frango Grelhado (caramelo pastel com marquinhas) */}
      <g id="meat">
        <path
          d="M 195 230 C 200 210, 240 215, 265 235 C 285 255, 275 285, 245 295 C 215 305, 180 280, 185 260 C 188 245, 190 235, 195 230 Z"
          fill="#F3C68F"
          stroke="#C97A3E"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Marcas de grelha em tons suaves */}
        <line x1="210" y1="240" x2="225" y2="255" stroke="#C97A3E" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="230" y1="245" x2="250" y2="265" stroke="#C97A3E" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="245" y1="265" x2="260" y2="280" stroke="#C97A3E" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Salada Fresca (alface e tomatinhos) */}
      <g id="salad">
        {/* Folhas de alface em verde pastel suave */}
        <circle cx="130" cy="255" r="18" fill="#B7E4C7" stroke="#74C69D" strokeWidth="3.5" />
        <circle cx="150" cy="275" r="16" fill="#95D5B2" stroke="#52B788" strokeWidth="3.5" />
        <circle cx="135" cy="285" r="14" fill="#B7E4C7" stroke="#74C69D" strokeWidth="3.5" />
        <circle cx="165" cy="265" r="12" fill="#D8F3DC" stroke="#74C69D" strokeWidth="3" />

        {/* Tomates-cereja fatiados em vermelho/rosa pastel */}
        <circle cx="148" cy="252" r="9" fill="#FF9B9B" stroke="#EE6055" strokeWidth="3" />
        <path d="M 145 250 Q 148 247 151 250" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        <circle cx="125" cy="272" r="8" fill="#FF9B9B" stroke="#EE6055" strokeWidth="3" />
        <circle cx="162" cy="282" r="7" fill="#FF8585" stroke="#EE6055" strokeWidth="2.5" />
      </g>
    </g>

    {/* Fumacinha de comida quente */}
    <g id="steam" fill="none" stroke="#E29578" strokeWidth="3.5" strokeLinecap="round" opacity="0.6">
      <path d="M 190 115 C 185 100, 195 90, 190 75" />
      <path d="M 215 120 C 225 105, 215 95, 225 80" />
    </g>
  </svg>
);

export const DinnerIcon: React.FC<MealIconProps> = ({ className = 'w-full h-full' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    className={className}
    role="img"
    aria-label="Jantar"
  >
    {/* 1. Sombra de chão */}
    <ellipse cx="200" cy="340" rx="160" ry="12" fill="#E2E8F0" opacity="0.6" />

    {/* 2. Base de apoio: Prato raso exterior/aba larga de cerâmica */}
    <g id="base-plate">
      {/* Borda externa do prato fundo/raso de sopa */}
      <ellipse
        cx="200"
        cy="285"
        rx="155"
        ry="42"
        fill="#E8F5E9"
        stroke="#688F80"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Anel interno da aba larga decorativa */}
      <ellipse cx="200" cy="285" rx="140" ry="36" fill="#F4FAF6" stroke="#94BCAE" strokeWidth="4" />
    </g>

    {/* 3. Elemento traseiro (detalhe sutil de base/profundidade) */}
    <g id="back-elements">
      {/* Contorno de apoio da cavidade rasa */}
      <ellipse cx="200" cy="287" rx="102" ry="26" fill="#A5D6A7" stroke="#688F80" strokeWidth="5" />
    </g>

    {/* 4. Objeto principal: Cavidade rasa com sopa cremosa */}
    <g id="main-object">
      {/* Depressão/Bojo raso da sopa */}
      <ellipse cx="200" cy="286" rx="98" ry="24" fill="#C8E6C9" />

      {/* Brilho lateral estrutural na borda interna */}
      <path
        d="M 106 284 C 112 298, 145 306, 175 308 C 145 304, 120 295, 114 284 Z"
        fill="#F4FAF6"
        opacity="0.7"
      />

      {/* Superfície do caldo espalhado no prato raso */}
      <ellipse
        cx="200"
        cy="287"
        rx="90"
        ry="21"
        fill="#D7A86E"
        stroke="#8C6541"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Profundidade suave no centro do caldo */}
      <ellipse cx="200" cy="288" rx="76" ry="16" fill="#C59356" />

      {/* Fio de azeite / Espiral elegante de creme */}
      <path
        d="M 160 286 C 175 296, 225 296, 240 286 C 248 280, 225 277, 200 280 C 180 282, 178 290, 198 291 C 210 291, 218 287, 210 284"
        fill="none"
        stroke="#F5EBE1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Guarnição de ervas e croutons flutuantes */}
      <rect x="180" y="282" width="9" height="7" rx="2" fill="#F6BD60" stroke="#8C6541" strokeWidth="2.5" />
      <rect x="214" y="285" width="8" height="6" rx="2" fill="#F5CAC3" stroke="#8C6541" strokeWidth="2.5" />

      {/* Ervas frescas / Folhinhas verdes */}
      <circle cx="168" cy="285" r="3" fill="#7BAE7F" />
      <circle cx="202" cy="280" r="2.5" fill="#7BAE7F" />
      <circle cx="230" cy="283" r="2" fill="#7BAE7F" />
      <circle cx="192" cy="288" r="2" fill="#7BAE7F" />
    </g>

    {/* 5. Acessório decorativo: Colher de sopa elegante repousando na lateral */}
    <g id="accessory" transform="rotate(-12 290 280)">
      {/* Cabo com camada dupla */}
      <path d="M 285 220 L 285 305" fill="none" stroke="#688F80" strokeWidth="12" strokeLinecap="round" />
      <path d="M 285 222 L 285 303" fill="none" stroke="#EDF2F4" strokeWidth="6" strokeLinecap="round" />
      {/* Bojo achatado da colher */}
      <ellipse cx="285" cy="208" rx="15" ry="21" fill="#EDF2F4" stroke="#688F80" strokeWidth="5" />
      {/* Sombra suave no bojo da colher */}
      <path
        d="M 276 208 C 276 222, 294 222, 294 208 C 294 202, 285 197, 276 208 Z"
        fill="#CBD5E1"
        opacity="0.6"
      />
    </g>

    {/* 6. Vapor aromático flutuando suavemente */}
    <g id="atmosphere" fill="none" strokeLinecap="round" opacity="0.85">
      {/* Linha central de calor */}
      <path
        d="M 200 250 C 190 225, 212 205, 202 180 C 194 160, 206 140, 200 120"
        stroke="#F6BD60"
        strokeWidth="6"
      />

      {/* Linha esquerda de vapor */}
      <path
        d="M 165 245 C 156 225, 175 205, 168 185 C 160 168, 172 150, 166 135"
        stroke="#F5CAC3"
        strokeWidth="5"
      />

      {/* Linha direita de vapor */}
      <path
        d="M 235 245 C 244 225, 224 205, 232 185 C 238 168, 228 150, 234 135"
        stroke="#F6BD60"
        strokeWidth="5"
      />
    </g>
  </svg>
);

export const SnackIcon: React.FC<MealIconProps> = ({ className = 'w-full h-full' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    className={className}
    role="img"
    aria-label="Lanches"
  >
    {/* 1. Sombra de apoio no chão */}
    <ellipse cx="200" cy="355" rx="145" ry="12" fill="#E2E8F0" opacity="0.6" />

    {/* 2. Base de apoio: Bandeja escolar de cantina */}
    <g id="base-plate">
      {/* Prato/bandeja retangular arredondada de apoio */}
      <rect
        x="55"
        y="300"
        width="290"
        height="42"
        rx="18"
        fill="#E8F5E9"
        stroke="#688F80"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <rect
        x="68"
        y="306"
        width="264"
        height="28"
        rx="12"
        fill="#F4FAF6"
        stroke="#94BCAE"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </g>

    {/* 3. Elemento traseiro: Caixinha de suco/leite escolar */}
    <g id="back-elements">
      {/* Corpo da caixinha */}
      <rect
        x="235"
        y="165"
        width="68"
        height="135"
        rx="10"
        fill="#A5D6A7"
        stroke="#688F80"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Aba superior dobrada da caixinha */}
      <path
        d="M 235 178 L 269 152 L 303 178 Z"
        fill="#C8E6C9"
        stroke="#688F80"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Faixa decorativa pastel */}
      <path
        d="M 235 210 L 303 210 L 303 245 L 235 245 Z"
        fill="#F5CAC3"
        stroke="#8C6541"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Estampa clássica de fruta / detalhe suave */}
      <circle cx="269" cy="227" r="7" fill="#F6BD60" stroke="#8C6541" strokeWidth="2.5" />
      <path
        d="M 269 220 C 269 216, 274 214, 275 214"
        fill="none"
        stroke="#7BAE7F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Canudinho listrado saindo inclinado */}
      <g transform="rotate(-15 275 140)">
        <path d="M 275 95 L 275 155" fill="none" stroke="#688F80" strokeWidth="8" strokeLinecap="round" />
        <path d="M 275 97 L 275 153" fill="none" stroke="#EDF2F4" strokeWidth="4" strokeLinecap="round" />
        {/* Listras do canudo */}
        <path
          d="M 273 110 L 277 114 M 273 125 L 277 129 M 273 140 L 277 144"
          stroke="#F5CAC3"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </g>

    {/* 4. Objeto principal: Maçã clássica do recreio */}
    <g id="main-object">
      {/* Folha e cabinho da maçã */}
      <path
        d="M 152 205 C 152 185, 160 178, 168 175"
        fill="none"
        stroke="#8C6541"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 166 182 C 182 175, 188 186, 186 195 C 172 195, 166 188, 166 182 Z"
        fill="#7BAE7F"
        stroke="#688F80"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Corpo da maçã */}
      <path
        d="M 150 205 C 130 195, 95 205, 95 240 C 95 285, 130 305, 150 305 C 170 305, 205 285, 205 240 C 205 205, 170 195, 150 205 Z"
        fill="#F5CAC3"
        stroke="#8C6541"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Brilho lateral em formato de meia-lua suave */}
      <path
        d="M 112 225 C 104 240, 108 268, 120 282 C 112 270, 110 245, 118 230 Z"
        fill="#F5EBE1"
        opacity="0.7"
      />

      {/* Detalhe da covinha superior */}
      <path
        d="M 142 206 C 148 212, 154 212, 160 206"
        fill="none"
        stroke="#8C6541"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>

    {/* 5. Acessório decorativo: Biscoito / Cookie artesanal apoiado */}
    <g id="accessory" transform="rotate(-10 105 295)">
      {/* Base do biscoito crocante */}
      <ellipse cx="105" cy="295" rx="26" ry="18" fill="#D7A86E" stroke="#8C6541" strokeWidth="5" />
      <ellipse cx="103" cy="293" rx="22" ry="14" fill="#C59356" opacity="0.4" />
      {/* Gotas de chocolate pastel */}
      <circle cx="96" cy="292" r="3.5" fill="#8C6541" />
      <circle cx="112" cy="290" r="3" fill="#8C6541" />
      <circle cx="104" cy="301" r="3" fill="#8C6541" />
      <circle cx="118" cy="298" r="2.5" fill="#8C6541" />
    </g>

    {/* 6. Vapor / Partículas lúdicas flutuantes da merenda */}
    <g id="atmosphere" fill="none" strokeLinecap="round" opacity="0.85">
      {/* Pequenas estrelas/brilhos de comida fresquinha */}
      <path d="M 100 170 L 100 180 M 95 175 L 105 175" stroke="#F6BD60" strokeWidth="4" />
      <circle cx="100" cy="175" r="1.5" fill="#F6BD60" />

      <path d="M 215 135 L 215 145 M 210 140 L 220 140" stroke="#F6BD60" strokeWidth="4" />
      <circle cx="215" cy="140" r="1.5" fill="#F6BD60" />

      {/* Curva de frescor suave no ar */}
      <path
        d="M 315 130 C 322 118, 312 108, 318 96 C 322 86, 315 78, 320 68"
        stroke="#F5CAC3"
        strokeWidth="5"
      />
      <path d="M 288 88 C 294 78, 286 70, 290 60" stroke="#7BAE7F" strokeWidth="4" />
    </g>
  </svg>
);
