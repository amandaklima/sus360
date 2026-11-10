package br.unicap.sus360.unidade;

import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.unicap.sus360.comum.Texto;

@Repository
public class UnidadeRepository {

    private static final String SELECT = """
            select u.id, u.nome, u.tipo, u.endereco, u.bairro, u.horario, u.telefone, u.foto,
                   coalesce(r.media, 0) as nota,
                   coalesce(r.total, 0) as avaliacoes,
                   coalesce((select array_agg(s.nome order by s.categoria, s.nome)
                               from unidade_servico s
                              where s.unidade_id = u.id), '{}') as servicos
              from unidade u
              left join (select unidade_id, round(avg(nota), 1) as media, count(*) as total
                           from avaliacao
                          group by unidade_id) r on r.unidade_id = u.id
            """;

    private final NamedParameterJdbcTemplate jdbc;

    public UnidadeRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Lista unidades. Filtros nulos são ignorados. */
    public List<Unidade> listar(String tipo, String categoria, String busca) {
        StringBuilder sql = new StringBuilder(SELECT).append("where true\n");
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (tipo != null) {
            sql.append("and u.tipo = :tipo\n");
            params.addValue("tipo", tipo);
        }
        if (categoria != null) {
            sql.append("""
                    and exists (select 1 from unidade_servico s
                                 where s.unidade_id = u.id and s.categoria = :categoria)
                    """);
            params.addValue("categoria", categoria);
        }
        if (busca != null && !busca.isBlank()) {
            // nome da unidade, bairro, endereço ou nome/categoria de um serviço; sem diferenciar acento/maiúscula
            sql.append("""
                    and (normalizar(u.nome) like :busca escape '\\'
                         or normalizar(u.bairro) like :busca escape '\\'
                         or normalizar(u.endereco) like :busca escape '\\'
                         or exists (select 1 from unidade_servico s
                                     where s.unidade_id = u.id
                                       and (normalizar(s.nome) like :busca escape '\\'
                                            or normalizar(s.categoria) like :busca escape '\\')))
                    """);
            params.addValue("busca", Texto.padraoContem(busca));
        }
        sql.append("order by u.nome");

        return jdbc.query(sql.toString(), params, UnidadeRepository::mapear);
    }

    public Optional<Unidade> buscarPorId(long id) {
        return jdbc.query(SELECT + "where u.id = :id", new MapSqlParameterSource("id", id), UnidadeRepository::mapear)
                .stream()
                .findFirst();
    }

    public boolean existe(long id) {
        Boolean existe = jdbc.queryForObject("select exists (select 1 from unidade where id = :id)",
                new MapSqlParameterSource("id", id), Boolean.class);
        return Boolean.TRUE.equals(existe);
    }

    private static Unidade mapear(ResultSet rs, int linha) throws SQLException {
        Array servicos = rs.getArray("servicos");
        return new Unidade(
                rs.getLong("id"),
                rs.getString("nome"),
                rs.getString("tipo"),
                rs.getString("endereco"),
                rs.getString("bairro"),
                rs.getString("horario"),
                rs.getString("telefone"),
                rs.getString("foto"),
                rs.getDouble("nota"),
                rs.getLong("avaliacoes"),
                servicos == null ? List.of() : Arrays.asList((String[]) servicos.getArray()));
    }
}
