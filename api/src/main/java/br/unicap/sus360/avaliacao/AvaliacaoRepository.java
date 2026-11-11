package br.unicap.sus360.avaliacao;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoDetalhe;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoResumo;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.UnidadeAvaliada;

@Repository
public class AvaliacaoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AvaliacaoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long contarPorUnidade(long unidadeId, Integer nota) {
        MapSqlParameterSource params = new MapSqlParameterSource("unidadeId", unidadeId);
        String sql = "select count(*) from avaliacao where unidade_id = :unidadeId";
        if (nota != null) {
            sql += " and nota = :nota";
            params.addValue("nota", nota);
        }
        Long total = jdbc.queryForObject(sql, params, Long.class);
        return total == null ? 0 : total;
    }

    /** Mais recentes primeiro. */
    public List<AvaliacaoResumo> listarPorUnidade(long unidadeId, Integer nota, int limite, long deslocamento) {
        MapSqlParameterSource params = new MapSqlParameterSource("unidadeId", unidadeId)
                .addValue("limite", limite)
                .addValue("deslocamento", deslocamento);
        StringBuilder sql = new StringBuilder("""
                select id, autor, nota, data_atendimento, texto
                  from avaliacao
                 where unidade_id = :unidadeId""");
        if (nota != null) {
            sql.append(" and nota = :nota");
            params.addValue("nota", nota);
        }
        sql.append(" order by data_atendimento desc, id desc limit :limite offset :deslocamento");

        return jdbc.query(sql.toString(), params, (rs, i) -> new AvaliacaoResumo(
                rs.getLong("id"),
                rs.getString("autor"),
                rs.getInt("nota"),
                rs.getObject("data_atendimento", LocalDate.class),
                rs.getString("texto")));
    }

    public Optional<AvaliacaoDetalhe> buscarPorId(long id) {
        String sql = """
                select a.id, a.autor, a.nota, a.data_atendimento, a.texto,
                       u.id as u_id, u.nome as u_nome, u.tipo as u_tipo, u.endereco as u_endereco,
                       u.horario as u_horario, u.telefone as u_telefone
                  from avaliacao a
                  join unidade u on u.id = a.unidade_id
                 where a.id = :id
                """;
        return jdbc.query(sql, new MapSqlParameterSource("id", id), (rs, i) -> new AvaliacaoDetalhe(
                        rs.getLong("id"),
                        rs.getString("autor"),
                        rs.getInt("nota"),
                        rs.getObject("data_atendimento", LocalDate.class),
                        rs.getString("texto"),
                        new UnidadeAvaliada(
                                rs.getLong("u_id"),
                                rs.getString("u_nome"),
                                rs.getString("u_tipo"),
                                rs.getString("u_endereco"),
                                rs.getString("u_horario"),
                                rs.getString("u_telefone"))))
                .stream()
                .findFirst();
    }

    /** Insere e devolve o id gerado. */
    public long inserir(long unidadeId, long usuarioId, String autor, int nota, LocalDate data, String texto) {
        String sql = """
                insert into avaliacao (unidade_id, usuario_id, autor, nota, data_atendimento, texto)
                values (:unidadeId, :usuarioId, :autor, :nota, :data, :texto)
                returning id
                """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("unidadeId", unidadeId)
                .addValue("usuarioId", usuarioId)
                .addValue("autor", autor)
                .addValue("nota", nota)
                .addValue("data", data)
                .addValue("texto", texto);
        Long id = jdbc.queryForObject(sql, params, Long.class);
        if (id == null) {
            throw new IllegalStateException("O banco não devolveu o id da avaliação.");
        }
        return id;
    }
}
