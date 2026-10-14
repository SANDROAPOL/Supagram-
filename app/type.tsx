// Definiciones compartidas para la UI del feed y los datos de la app.
// Centralizamos aquí los tipos para mantener coherencia entre componentes.

export interface Profile {
  // Nombre visible del usuario dentro de la app.
  username: string;
  // URL del avatar; puede venir null si el perfil no tiene imagen.
  avatar_url: string | null;
}

export interface Comment {
  // Identificador único del comentario.
  id: string;
  // ID del usuario que lo escribió.
  user_id: string;
  // Relación con el post al que pertenece.
  post_id: string | number;
  // Texto del comentario.
  body: string;
  // Fecha de creación del comentario.
  created_at: Date;
  // Perfil opcional del autor, útil para mostrar nombre y avatar.
  profile?: Profile;
}

export interface Post {
  // ID del post; puede venir como string o number
  id: number | string;
  // Usuario dueño del post
  user_id: string;
  // Perfil opcional del autor para mostrar datos del usuario
  profile?: Profile;
  // URL de la imagen del post
  image_url: string;
  // Texto del post o descripción
  caption: string;
  // Cantidad actual de likes
  likes_count: number;
  // Estado del like del usuario actual
  isLiked?: boolean;
  // Lista de comentarios asociados al post
  comments?: Comment[];
  // Fecha de creación del post
  created_at: Date;
  // Fecha de actualización opcional
  updated_at?: Date;
}

export interface PostCardProps {
  // Post que se renderizará en la tarjeta
  post: Post;
  // ID del usuario autenticado, puede ser null cuando no hay sesión
  currentUserId: string | null;
  // Callback para dar/quitar like
  onLike: (postId: number | string) => void;
  // Callback para publicar un comentario
  onComment: (postId: number | string, body: string) => void;
}