package br.unicap.sus360.auth;

import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.unicap.sus360.auth.AuthDtos.Usuario;

@Repository
public class UsuarioRepository {

    /** Usuário com o hash da senha — só circula dentro do pacote de autenticação. */
    record UsuarioComSenha(Usuario usuario, String senhaHash) {
    }

    private final NamedParameterJdbcTemplate jdbc;

    public UsuarioRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    Optional<UsuarioComSenha> buscarPorEmail(String email) {
        return jdbc.query("""
                        select id, nome, email, senha_hash
                          from usuario
                         where lower(email) = lower(:email)
                        """,
                new MapSqlParameterSource("email", email),
                (rs, i) -> new UsuarioComSenha(
                        new Usuario(rs.getLong("id"), rs.getString("nome"), rs.getString("email")),
                        rs.getString("senha_hash")))
                .stream()
                .findFirst();
    }

    public Optional<Usuario> buscarPorId(long id) {
        return jdbc.query("select id, nome, email from usuario where id = :id",
                        new MapSqlParameterSource("id", id),
                        (rs, i) -> new Usuario(rs.getLong("id"), rs.getString("nome"), rs.getString("email")))
                .stream()
                .findFirst();
    }

    /** Insere e devolve o id. Lança DuplicateKeyException se o e-mail já existir. */
    long inserir(String nome, String email, String senhaHash) {
        Long id = jdbc.queryForObject("""
                        insert into usuario (nome, email, senha_hash)
                        values (:nome, :email, :senhaHash)
                        returning id
                        """,
                new MapSqlParameterSource()
                        .addValue("nome", nome)
                        .addValue("email", email)
                        .addValue("senhaHash", senhaHash),
                Long.class);
        if (id == null) {
            throw new IllegalStateException("O banco não devolveu o id do usuário.");
        }
        return id;
    }
}
