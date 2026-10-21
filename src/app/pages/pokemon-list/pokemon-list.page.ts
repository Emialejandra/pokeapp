
import { Component, OnInit } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.page.html',
  styleUrls: ['./pokemon-list.page.scss'],
})
export class PokemonListPage implements OnInit {
  // Navegación
  activeTab: 'pokedex' | 'comparar' = 'pokedex';

  // Pokédex
  pokemons: any[] = [];
  searchTerm = '';
  selectedPokemon: any = null;
  loading = false;
  errorMessage = '';

  // Comparación
  compareSearch1 = '';
  compareSearch2 = '';
  comparison1: any = null;
  comparison2: any = null;
  compareLoading = false;
  compareError = '';

  constructor(private pokemonService: PokemonService) { }

  ngOnInit() {
    this.fetchPokemons();
  }

  // Cargar la lista inicial
  fetchPokemons() {
    this.loading = true;
    this.errorMessage = '';

    this.pokemonService.getPokemons(50).subscribe({
      next: (response) => {
        this.pokemons = response.results;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo cargar la lista. Revisa tu conexión a Internet.';
        this.loading = false;
      },
    });
  }

  // Buscar Pokémon por nombre o número
  searchPokemon() {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      this.errorMessage = 'Escribe el nombre o número de un Pokémon.';
      this.selectedPokemon = null;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.selectedPokemon = null;

    this.pokemonService.getPokemonDetails(query).subscribe({
      next: (pokemon) => {
        this.selectedPokemon = pokemon;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No encontramos ese Pokémon. Intenta con otro nombre o número.';
        this.loading = false;
      },
    });
  }

  // Seleccionar un Pokémon de la lista
  selectPokemon(name: string) {
    this.searchTerm = name;
    this.searchPokemon();
  }

  // Volver a la lista
  clearSearch() {
    this.searchTerm = '';
    this.selectedPokemon = null;
    this.errorMessage = '';
  }

  // Formatear nombres
  formatName(name: string): string {
    return name.replace(/-/g, ' ');
  }

  // Obtener la imagen principal
  getPokemonImage(pokemon: any): string {
    return (
      pokemon?.sprites?.other?.['official-artwork']?.front_default ||
      pokemon?.sprites?.front_default ||
      'assets/icon/favicon.png'
    );
  }

  // Obtener el sonido
  getPokemonSound(pokemon: any): string | null {
    return pokemon?.cries?.latest || pokemon?.cries?.legacy || null;
  }

  // Reproducir sonido
  playPokemonSound() {
    const soundUrl = this.getPokemonSound(this.selectedPokemon);

    if (!soundUrl) {
      this.errorMessage = 'Este Pokémon no tiene un sonido disponible.';
      return;
    }

    const audio = new Audio(soundUrl);

    audio.play().catch(() => {
      this.errorMessage = 'No se pudo reproducir el sonido.';
    });
  }

  // Galería de imágenes disponibles
  getPokemonGallery(pokemon: any): string[] {
    const sprites = pokemon?.sprites;

    if (!sprites) {
      return [];
    }

    const images = [
      sprites.other?.['official-artwork']?.front_default,
      sprites.front_default,
      sprites.back_default,
      sprites.front_shiny,
      sprites.back_shiny,
      sprites.other?.home?.front_default,
      sprites.other?.dream_world?.front_default,
    ];

    return [...new Set(images.filter((image: string | null) => !!image))];
  }

  // Animación GIF de quinta generación
  getPokemonAnimation(pokemon: any): string {
    return (
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/' +
      pokemon.id +
      '.gif'
    );
  }

  // Comparar dos Pokémon

  comparePokemon() {
    const first = this.compareSearch1.trim().toLowerCase();
    const second = this.compareSearch2.trim().toLowerCase();

    this.compareError = '';
    this.comparison1 = null;
    this.comparison2 = null;

    if (!first || !second) {
      this.compareError = 'Ingresa los dos Pokémon que deseas comparar.';
      return;
    }

    if (first === second) {
      this.compareError = 'Debes ingresar dos Pokémon diferentes.';
      return;
    }

    this.compareLoading = true;

    this.pokemonService.getPokemonDetails(first).subscribe({
      next: (pokemon1) => {
        this.pokemonService.getPokemonDetails(second).subscribe({
          next: (pokemon2) => {
            this.comparison1 = pokemon1;
            this.comparison2 = pokemon2;
            this.compareLoading = false;
          },
          error: () => {
            this.compareError = 'No se encontró el segundo Pokémon.';
            this.compareLoading = false;
          }
        });
      },
      error: () => {
        this.compareError = 'No se encontró el primer Pokémon.';
        this.compareLoading = false;
      }
    });
  }

}
